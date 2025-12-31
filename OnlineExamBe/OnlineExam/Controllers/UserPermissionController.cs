using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces.PermissionFolder;
using OnlineExam.Attributes;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;

namespace OnlineExam.Controllers
{
    
        [ApiController]
        [Route("api/[controller]")]
        [SessionAuthorize]
        public class UserPermissionController : Controller
        {
            private IUserPermissionService _userPermissionService;
            public UserPermissionController(IUserPermissionService userPermissionService)
            {
                _userPermissionService = userPermissionService;
            }


            
            [HttpGet]
            [Route("get-all")]
            public async Task<IActionResult> GetAll()
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel.Data = await _userPermissionService.GetAllAsync();
                return Ok(resultApiModel);
            }

            
            [HttpGet]
            [Route("get-user-permission/{userId}")]
            public async Task<IActionResult> UGetPermissionByRole(int userId)
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel.Data = await _userPermissionService.GetUserPermission(userId);
                return Ok(resultApiModel);
            }


            [HttpGet]
            [Route("get/{id}")]
            public async Task<IActionResult> Get(int id)
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel.Data = await _userPermissionService.GetByIdAsync(id);
                resultApiModel.Status = true;
                return Ok(resultApiModel);
            }


            [HttpPost]
            [Route("create")]

            public async Task<IActionResult> Create(int userId, int PermissiontionId)
            {
            var newItem = new UserPermission
            {
                UserId = userId,
                PermissionId = PermissiontionId
            };
                await _userPermissionService.CreateAsync(newItem);
                return Ok();
            }

          
       
            [HttpDelete]
            [Route("delete")]
            public async Task<IActionResult> Delete(int id)
            {
                bool result = await _userPermissionService.DeleteAsync(id);
                if (result)
                {
                    return Ok();
                }
                return BadRequest("Không thấy chức năng này hoặc có lỗi trong quá trình xử lý");
            }

  
    }
    }

