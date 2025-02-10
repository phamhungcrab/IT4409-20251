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
    public class AuthService : CrudService<User>,IAuthService
    {
        private readonly IJwtService _jwtService;
        private readonly IUserService _userService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IEmailService _emailService;
        private readonly IRepository<RefreshToken> _refreshTokenRepository;
        private readonly IMemoryCache _cache;
        private readonly SmtpSettings _smtp;
        private readonly Random _random = new();
        public AuthService(IRepository<User> userRepository,
                           IRefreshTokenService refreshTokenService,
                           IJwtService jwtService,
                           IEmailService emailService,
                           IRepository<RefreshToken> refreshTokenRepository,
                           IMemoryCache cache,
                           IOptions<SmtpSettings> smtp,
                           IUserService userService) : base(userRepository)
        {
            _jwtService = jwtService;
            _userService = userService;
            _emailService = emailService;
            _refreshTokenRepository = refreshTokenRepository;
            _refreshTokenService = refreshTokenService;
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
            if (register == null || register.Email == null || register.Password == null ||
                register.DeviceId == null || register.IpAdress == null ||register.UserAgent == null)
            {
                return new ResultApiModel()
                {
                    IsStatus =false,
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
                var refreshToken = await _jwtService.generateRefreshToken(user, 15, register.DeviceId, register.IpAdress, register.UserAgent);

                var accessToken = _jwtService.GenerateAccessToken(user, 15, register.DeviceId, register.IpAdress, register.UserAgent);

                await _refreshTokenService.CreateAsync(refreshToken);

                var tokenResponse = new TokenResponse
                {
                    RefreshToken = refreshToken.Token,
                    AccessToken = accessToken,
                };

                return new ResultApiModel()
                {
                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = tokenResponse
                };


            }

        }

        public async Task<ResultApiModel> Login(LoginDto login)
        {
            if (login == null || login.Email == null || login.Password == null ||
                login.DeviceId == null || login.IpAdress == null || login.UserAgent == null)
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
            // tim token cu va kiem tra
            var refreshToken = (await _refreshTokenRepository.FindAsync(t => t.UserId.Equals(user.Id) && t.DeviceId.Equals(login.DeviceId)
                                                                          && t.IpAddress.Equals(login.IpAdress) && t.UserAgent.Equals(login.UserAgent) && !t.IsExpired));

            if(refreshToken.Any()) {
                refreshToken.First().IsExpired = true;
                await _refreshTokenService.UpdateAsync(refreshToken.First());
            }
                // tao token moi
                var newAccessToken = _jwtService.GenerateAccessToken(user, 150000, login.DeviceId, login.IpAdress, login.UserAgent);
                var newRefreshToken = await _jwtService.generateRefreshToken(user, 15, login.DeviceId, login.IpAdress, login.UserAgent);

                await _refreshTokenService.CreateAsync(newRefreshToken);

            // Tra ve access token va refresh token
            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = new TokenResponse()
                {
                    AccessToken = newAccessToken,
                    RefreshToken  = newRefreshToken.Token,
                }
            };

        }

        public async Task<ResultApiModel> Logout(LogoutDto logout)
        {
            var refreshToken = (await _refreshTokenRepository.FindAsync(t => t.UserId.Equals(logout.UserId) && t.DeviceId.Equals(logout.DeviceId)
                                                                         && t.IpAddress.Equals(logout.IpAddress) && t.UserAgent.Equals(logout.UserAgent) && !t.IsExpired));

            if (refreshToken.Any())
            {
                refreshToken.First().IsExpired = true;
                await _refreshTokenService.UpdateAsync(refreshToken.First());
            }

            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = "Dang xuat thanh cong"
            };
        }


        public async Task<ResultApiModel> ChangePassword(ChangePasswordDto changePassword)
        {
            User? user = await _userService.GetUserByEmail(changePassword.Email);
            if(user == null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode= ResponseCode.NotFound,
                    Data = "Khong ton tai email nay"
                };
            }
            // hask mkhau
            var newPasswordHash = changePassword.OldPassword;

            if (!newPasswordHash.Equals(user.PasswordHash))
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Sai mat khau"
                };
            }

            user.PasswordHash = newPasswordHash;
            await _userService.UpdateAsync(user);
            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = "Cap nhat mat khau thanh cong"
            };
        }

        /// <summary>
        /// chua trien khai, chua co otp
        /// </summary>
        /// <param name="resetPassword"></param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        public async Task<ResultApiModel> ResetPassword(ResetPasswordDto resetPassword)
        {
            throw new NotImplementedException();
        }
        /// <summary>
        /// chua trien khai
        /// </summary>
        /// <param name="otp"></param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        public Task<ResultApiModel> CheckOtp(CheckOtpDto dto)
        {
            string cacheKey = $"otp:{dto.Email}";
            if (_cache.TryGetValue(cacheKey, out string? storedCode) && storedCode == dto.Otp)
            {
                _cache.Remove(cacheKey);
                return Task.FromResult(new ResultApiModel(){
                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = "Xac thuc otp thanh cong"
                });
            }
            return Task.FromResult(new ResultApiModel()
            {
                IsStatus = false,
                MessageCode = ResponseCode.BadRequest,
                Data = "Mã OTP không đúng hoặc đã hết hạn"
            });
        }
        /// <summary>
        /// Chua trien khai SendEmail
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

        public async Task<ResultApiModel> RefreshToken(RefreshTokenDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.RefreshToken))
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Invalid client request"
                };
            }

            var refreshToken = (await _refreshTokenRepository.FindAsync(t => t.Token == dto.RefreshToken)).FirstOrDefault();

            if (refreshToken == null || refreshToken.IsExpired)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.Unauthorized,
                    Data = "Invalid refresh token"
                };
            }

            var user = await _userService.GetByIdAsync(refreshToken.UserId);
            if (user == null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "User not found"
                };
            }

            // Revoke old refresh token
            refreshToken.IsExpired = true;
            await _refreshTokenService.UpdateAsync(refreshToken);

            // Generate new tokens
            var newAccessToken = _jwtService.GenerateAccessToken(user, 150000, dto.DeviceId, dto.IpAddress, dto.UserAgent);
            var newRefreshToken = await _jwtService.generateRefreshToken(user, 15, dto.DeviceId, dto.IpAddress, dto.UserAgent);
            await _refreshTokenService.CreateAsync(newRefreshToken);

            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = new TokenResponse()
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken.Token
                }
            };
        }
    }

}
