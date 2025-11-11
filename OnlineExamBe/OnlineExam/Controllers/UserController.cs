using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.RequestDtos.User;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;

namespace OnlineExam.Controllers
 
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : Controller
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Route("get-all")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAll() 
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel.Data = await _userService.GetAllAsync();
            return Ok(apiResultModel);
        }
        /// <summary>
        /// Dang ki hang loat user
        /// </summary>
        /// <param name="listUser"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("create-users")]
        [Authorize(Roles ="ADMIN")]
        public async Task<IActionResult> RegisterForUser(CreateUserAdminDto[] listUser)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel =  await _userService.CreateUsersAsync(listUser);
            return Ok(apiResultModel);
        }

        [HttpPost]
        [Route("create")]
        [Authorize(Roles ="ADMIN")]
        public async Task<IActionResult> Create(CreateUserAdminDto user)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _userService.CreateAsync(user);
            return Ok(apiResultModel);
        }

        [HttpPut]
        [Route("update")]

        public async Task<IActionResult> Update(CreateUserAdminDto user)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _userService.UpdateAsync(user);
            return Ok(apiResultModel);
        }

        [HttpPut]
        [Route("update-for-user")]

        public async Task<IActionResult> UserUpdate(UserUpdateDto user)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _userService.UserUpdateAsync(user);
            return Ok(apiResultModel);
        }
        [HttpDelete]
        [Route("delete")]

        public async Task<IActionResult> Delete(int userId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            var success = await _userService.DeleteAsync(userId);
            apiResultModel.IsStatus = success;
            apiResultModel.Data = success;
            if (success)
            {
                apiResultModel.MessageCode = ResponseCode.NotFound;
            }
            else
            {
                apiResultModel.MessageCode = ResponseCode.Success;
            }
            return Ok(apiResultModel);  
        }


    }
}