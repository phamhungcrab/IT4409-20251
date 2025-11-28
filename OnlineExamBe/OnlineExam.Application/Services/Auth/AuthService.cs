using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.Win32;
using OnlineExam.Application.Dtos.ReponseDtos;
using OnlineExam.Application.Dtos.RequestDtos.Auth;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Services.Base;
using OnlineExam.Application.Settings;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace OnlineExam.Application.Services.Auth
{
    public class AuthService : CrudService<User>, IAuthService
    {
        private readonly IUserService _userService;
        private readonly ISessionService _sessionService;
        private readonly IEmailService _emailService;
        private readonly IRepository<Session> _sessionRepository;
        private readonly IMemoryCache _cache;
        private readonly SmtpSettings _smtp;
        private readonly Random _random = new();
        public AuthService(IRepository<User> userRepository,
                           ISessionService sessionService,
                           IEmailService emailService,
                           IRepository<Session> sessionRepository,
                           IMemoryCache cache,
                           IOptions<SmtpSettings> smtp,
                           IUserService userService) : base(userRepository)
        {

            _userService = userService;
            _emailService = emailService;
            _sessionRepository = sessionRepository;
            _sessionService = sessionService;
            _cache = cache;
            _smtp = smtp.Value;
        }


        /// <summary>
        /// Dang ki tai khoan
        /// </summary>
        /// <param name = "register" ></ param >
        /// < returns > Token neu thanh cong</returns>
        /// <exception cref = "ArgumentNullException" ></ exception >
        public async Task<ResultApiModel> Register(RegisterDto register)
        {
            if (register == null || register.Email == null || register.Password == null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Thieu thong tin dang ky"
                };
            }
            else
            {

                var checkMail = await _repository.FindAsync(x => x.Email.ToLower().Equals(register.Email.ToLower()));
                if (checkMail.Any())
                {
                    return new ResultApiModel()
                    {
                        IsStatus = false,
                        MessageCode = ResponseCode.Conflict,
                        Data = "Email da ton tai"
                    };
                }

                var user = new User
                {
                    Email = register.Email,
                    MSSV = register.MSSV,
                    DateOfBirth = register.DateOfBirth,
                    FullName = register.FullName,
                    PasswordHash = register.Password,
                    Role = register.Role
                };
                await base.CreateAsync(user);
                var session = await _sessionService.CreateAsync(user, 30);

                return new ResultApiModel()
                {
                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = session.SessionString
                };


            }

        }

        public async Task<ResultApiModel> Login(LoginDto login)
        {
            if (login == null || login.Email == null || login.Password == null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Thieu thong tin dang nhap"
                };
            }
            var user = await _userService.GetUserByEmail(login.Email);
            if (user == null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Khong ton tai Email"
                };

            }
            //hash password de so sanh
            var passwordHash = HashPassword(login.Password);

            if (!passwordHash.Equals(user.PasswordHash))
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.Unauthorized,
                    Data = "Sai mat khau"
                };
            }

            var session = await _sessionService.CreateAsync(user, 30);

            // Tra ve access token va refresh token
            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = session.SessionString
            };

        }

        public async Task<ResultApiModel> Logout(LogoutDto logout)
        {

            var isDeleted = (await _sessionService.DeleteByUserIdAsync(logout.UserId));

            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = "Dang xuat thanh cong"
            };
        }


        public async Task<ResultApiModel> ChangePassword(ChangePasswordDto changePassword)
        {
            User user = await _userService.GetUserByEmail(changePassword.Email);
            if (user == null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Khong ton tai email nay"
                };
            }
            // hask mkhau
            var oldPasswordHash = HashPassword(changePassword.OldPassword);

            if (!oldPasswordHash.Equals(user.PasswordHash))
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Sai mat khau"
                };
            }

            user.PasswordHash = HashPassword(changePassword.NewPassword);
            await _userService.UpdateAsync(user);
            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = "Cap nhat mat khau thanh cong"
            };
        }

        /// <summary>
        /// Quen mat khau
        /// </summary>
        /// <param name="resetPassword"></param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        public async Task<ResultApiModel> ResetPassword(ResetPasswordDto resetPassword)
        {

            User user = await _userService.GetUserByEmail(resetPassword.Email);
            if (user == null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Khong ton tai email nay"
                };
            }

            string resetKey = $"reset:{resetPassword.Email}";
            if (_cache.TryGetValue(resetKey, out string? storedCode) && storedCode == resetPassword.ResetCode)
            {
                _cache.Remove(resetKey);
                user.PasswordHash = HashPassword(resetPassword.NewPassword);
                await _userService.UpdateAsync(user);
                return new ResultApiModel
                {

                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = "Cập nhật mật khẩu thành công"
                };
            }
            else
            {
                return new ResultApiModel
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Mã OTP đã hết hạn"
                };
            }

        }
        /// <summary>
        /// check OTP
        /// </summary>
        /// <param name="otp"></param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        public async Task<ResultApiModel> CheckOtp(CheckOtpDto dto)
        {
            string cacheKey = $"otp:{dto.Email}";
            var otp = _cache.TryGetValue(cacheKey, out string? storedCode);
            if (otp && storedCode == dto.Otp)
            {
                _cache.Remove(cacheKey);
                string resetToken = Guid.NewGuid().ToString();
                string resetKey = $"reset:{dto.Email}";
                _cache.Set(resetKey, resetToken, TimeSpan.FromMinutes(5));
                return new ResultApiModel()
                {
                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = resetToken
                };
            }
            return new ResultApiModel()
            {
                IsStatus = false,
                MessageCode = ResponseCode.BadRequest,
                Data = "Mã OTP không đúng hoặc đã hết hạn"
            };
        }
        /// <summary>
        /// Gui OTP
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<ResultApiModel> SendOtp(SendOtpDto dto)
        {
            string code = _random.Next(100000, 999999).ToString();
            string cacheKey = $"otp:{dto.Email}";
            _cache.Set(cacheKey, code, TimeSpan.FromMinutes(3));

            var to = new[] { dto.Email };

            await _emailService.SendMail(dto.Email, code);
            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = "Gửi OTP thành công"
            };
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes);
        }
    }
}
