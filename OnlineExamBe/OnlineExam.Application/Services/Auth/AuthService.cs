using Microsoft.Win32;
using OnlineExam.Application.Dtos.ReponseDtos;
using OnlineExam.Application.Dtos.RequestDtos.Auth;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services.Auth
{
    public class AuthService : CrudService<User>,IAuthService
    {
        private readonly IJwtService _jwtService;
        private readonly IUserService _userService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IEmailService _emailService;
        private readonly IRepository<RefreshToken> _refreshTokenRepository;
        public AuthService(IRepository<User> userRepository,
                           IRefreshTokenService refreshTokenService,
                           IJwtService jwtService,
                           IEmailService emailService,
                           IRepository<RefreshToken> refreshTokenRepository,
                           IUserService userService) : base(userRepository)
        {
            _jwtService = jwtService;
            _userService = userService;
            _emailService = emailService;
            _refreshTokenRepository = refreshTokenRepository;
            _refreshTokenService = refreshTokenService;
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
            var passwordHash = login.Password;

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
            User user = await _userService.GetUserByEmail(changePassword.Email);
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
        public async Task<ResultApiModel> CheckOtp(OtpDto otp)
        {
            //lay otp trong cache roi so sanh voi thoi gian het han
            throw new NotImplementedException();
        }
        /// <summary>
        /// Chua trien khai SendEmail
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public bool SendOtp(User user)
        {
            var otp = new Random().Next(100000, 1000000).ToString();
            var to = new[] { user.Email };
            string subject ="";
            string body="" ;
            
            var kq =_emailService.SendMail(to,subject,body);
            return kq;
        }
    }

}
