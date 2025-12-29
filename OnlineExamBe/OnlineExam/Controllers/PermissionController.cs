using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces.PermissionService;
using OnlineExam.Attributes;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;

namespace OnlineExam.Controllers
{
    
        [ApiController]
        [Route("api/[controller]")]
        [SessionAuthorize(UserRole.ADMIN)]
        public class PermissionController : Controller
        {
            private IPermissionService _permissionService;
            public PermissionController(IPermissionService permissionService)
            {
                _permissionService = permissionService;
            }
            
            [HttpGet]
            [Route("get/{id}")]
            public async Task<IActionResult> Get(int id)
            {
                ResultApiModel resultApiModel = new ResultApiModel();
                var result = await _permissionService.GetByIdAsync(id, ["GroupPermission"]);
                if(result == null)
                {
                resultApiModel.Status = false;
                return NotFound(resultApiModel);
                }
                resultApiModel.Data = new PermissionDto(result);
                
                resultApiModel.Status = true;
                return Ok(resultApiModel);
            }

            [HttpGet]
            [Route("get-by-group/{groupId}")]
            public async Task<IActionResult> GetByGroupId(int groupId)
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel.Data = await _permissionService.GetByGroupIdAsync(groupId);
                resultApiModel.Status = true;
                return Ok(resultApiModel);
            }
            [HttpGet]
            [Route("get-by-code/{code}")]
            public async Task<IActionResult> GetByCode(string code)
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel = await _permissionService.GetByCode(code);
                resultApiModel.Status = true;
                return Ok(resultApiModel);
            }
        [HttpPost]
            [Route("create")]

            public async Task<IActionResult> Create(CreatePermissionDto Permission)
            {
                ResultApiModel resultApiModel = new ResultApiModel();
                resultApiModel = await _permissionService.Create(Permission);
                return Ok(resultApiModel);
            }

            [HttpPut]
            [Route("update")]
            public async Task<IActionResult> Update(UpdatePermissionDto Permission)
            {
                ResultApiModel resultApiModel = new ResultApiModel();
            resultApiModel = await _permissionService.Update(Permission);
            return Ok(resultApiModel);
        }

            [HttpDelete]
            [Route("delete")]
            public async Task<IActionResult> Delete(int id)
            {
                bool result = await _permissionService.DeleteAsync(id);
                if (result)
                {
                    return Ok();
                }
                return BadRequest("Không thấy chức năng này hoặc có lỗi trong quá trình xử lý");
            }
        }
    }

