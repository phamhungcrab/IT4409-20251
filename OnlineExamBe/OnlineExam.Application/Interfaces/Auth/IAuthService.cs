using OnlineExam.Application.Dtos.RequestDtos.Auth;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.Auth
{
    public interface IAuthService
    {
        public Task<ResultApiModel> Register(RegisterDto register);
        public Task<ResultApiModel> Login(LoginDto login);
        public Task<ResultApiModel> Logout(LogoutDto logout);
        public Task<ResultApiModel> ChangePassword(ChangePasswordDto changePassword);
        public Task<ResultApiModel> ResetPassword(ResetPasswordDto resetPassword);
        public Task<ResultApiModel> CheckOtp(CheckOtpDto dto);
        public Task<ResultApiModel> SendOtp(SendOtpDto dto);
    }
}
