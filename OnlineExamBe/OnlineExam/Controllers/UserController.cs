using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.RequestDtos.UserDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.UserDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services;
using OnlineExam.Attributes;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Infrastructure.Policy.Requirements;
using System.Resources;
using System.Text.Json;

namespace OnlineExam.Controllers
 
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        private readonly IAuthorizationService _authorizationService;

        public UserController(IUserService userService, IAuthorizationService authorizationService)
        {
            _userService = userService;
            _authorizationService = authorizationService;
        }


        [HttpPost]
        [Route("search-for-admin")]
        [SessionAuthorize]
        public async Task<IActionResult> Search(SearchForAdminDto search)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _userService.SearchForAdminAsync(search);
            return Ok(apiResultModel);
        }

        [HttpPost]
        [Route("search-for-user")]
        [SessionAuthorize("F0222")]
        public async Task<IActionResult> Search(SearchForUserDto search)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel= await _userService.SearchForUserAsync(search);
            return Ok(apiResultModel);
        }
        [HttpGet]
        [Route("get-all")]
        [SessionAuthorize]
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
        [SessionAuthorize("F0221")]
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
        [SessionAuthorize]
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
        [SessionAuthorize]
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
        [SessionAuthorize("F0223")]
        public async Task<IActionResult> UserUpdate(UserUpdateDto user)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _userService.UserUpdateAsync(user);
            return Ok(apiResultModel);
        }
        [HttpDelete]
        [Route("delete")]
        [SessionAuthorize("F0224")]
        public async Task<IActionResult> Delete(int userId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            var authResult = await _authorizationService.AuthorizeAsync(User, userId, new ResourceRequirement(ResourceAction.Delete));
            if (!authResult.Succeeded) return Unauthorized("Forbidden: You do not have permission to perform this action.");
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