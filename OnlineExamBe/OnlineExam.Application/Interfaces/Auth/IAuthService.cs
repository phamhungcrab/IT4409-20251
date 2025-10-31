using OnlineExam.Application.Dtos.RequestDtos.Auth;
using OnlineExam.Application.Dtos.ResponseDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.Auth
{
    internal interface IAuthService
    {
        public Task<ResultApiModel> Register(RegisterDto register);
        public Task<ResultApiModel> Login(LoginDto login);
        public Task<ResultApiModel> Logout(int userId, string deviceId, string ipAddress, string userAgent);
        public Task<ResultApiModel> ChangePassword(ChangePasswordDto changePassword);
        public Task<ResultApiModel> ResetPassword(ResetPasswordDto resetPassword);
        public Task<ResultApiModel> CheckOtp(OtpDto otp);

    }
}
