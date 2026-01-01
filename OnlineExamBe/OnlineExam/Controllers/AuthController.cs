using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.RequestDtos.Auth;
using OnlineExam.Application.Dtos.RequestDtos.UserDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Services;
using OnlineExam.Application.Services.Auth;
using OnlineExam.Attributes;
using OnlineExam.Domain.Enums;

namespace OnlineExam.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly IAuthService _authservice;
        private readonly IUserService _userService;
        private readonly IAuthorizationService _authorizationService;
        public AuthController(IAuthService authservice, IUserService userService,
                                IAuthorizationService authorizationService) 
        { 
            _authservice = authservice;
            _userService = userService;
            _authorizationService = authorizationService;
        }
       
        

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login(LoginDto login)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _authservice.Login(login);
            return Ok(apiResultModel);
        }

        [HttpPost]
        [Route("logout")]
        public async Task<IActionResult> Logout(LogoutDto logout)
        {

            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await  _authservice.Logout(logout);
            if (apiResultModel.MessageCode == ResponseCode.Unauthorized) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(apiResultModel);
        }

        [HttpPost]
        [Route("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePassword)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _authservice.ChangePassword(changePassword);
            if (apiResultModel.MessageCode == ResponseCode.Unauthorized) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(apiResultModel);
        }

        [HttpPost]
        [Route("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPassword)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _authservice.ResetPassword(resetPassword);
            return Ok(apiResultModel);
        }

        [HttpPost]
        [Route("send-otp")]
        public async Task<IActionResult> SendOtp(SendOtpDto dto)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _authservice.SendOtp(dto);
            return Ok(apiResultModel);
        }

        [HttpPost]
        [Route("check-otp")]
        public async Task<IActionResult> CheckOtp(CheckOtpDto dto)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _authservice.CheckOtp(dto);
            if (apiResultModel.Status == true) return Ok(apiResultModel);
            else return BadRequest(apiResultModel);
        }
    }

}
