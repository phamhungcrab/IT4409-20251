using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.RequestDtos.User;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services;
using OnlineExam.Attributes;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System.Text.Json;

namespace OnlineExam.Controllers
 
{
    [ApiController]
    [Route("api/[controller]")]
    [SessionAuthorize]
    public class UserController : Controller
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Route("get-all")]
        [SessionAuthorize(UserRole.ADMIN)]
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
        [SessionAuthorize(UserRole.ADMIN)]
        public async Task<IActionResult> RegisterForUser(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            string json = await reader.ReadToEndAsync();

            var listUser = JsonSerializer.Deserialize<CreateUserAdminDto[]>(json);

            if (listUser == null)
                return BadRequest("Invalid JSON file");

            var result = await _userService.CreateUsersAsync(listUser);

            return Ok(result);
        }

        [HttpPost]
        [Route("create")]
        [SessionAuthorize(UserRole.ADMIN)]
        public async Task<IActionResult> Create(CreateUserAdminDto user)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _userService.CreateAsync(user);
            return Ok(apiResultModel);
        }

        /// <summary>
        /// update danh cho admin - tat ca thong tin
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("update")]
        [SessionAuthorize(UserRole.ADMIN)]
        public async Task<IActionResult> Update(CreateUserAdminDto user)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _userService.UpdateAsync(user);
            return Ok(apiResultModel);
        }

        /// <summary>
        /// update thong tin ca nhan cua user
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
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
        [SessionAuthorize(UserRole.ADMIN)]
        public async Task<IActionResult> Delete(int userId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            var success = await _userService.DeleteAsync(userId);
            apiResultModel.Status = success;
            apiResultModel.Data = success;
            if (success)
            {
                apiResultModel.MessageCode = ResponseCode.Success;
            }
            else
            {
                apiResultModel.MessageCode = ResponseCode.NotFound;
            }
            return Ok(apiResultModel);  
        }


    }
}