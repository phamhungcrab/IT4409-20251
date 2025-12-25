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
        [SessionAuthorize(UserRole.ADMIN)]
        public class RoleController : Controller
        {
            private IRoleService _roleService;
            public RoleController(IRoleService roleService)
            {
                _roleService = roleService;
            }


            
            [HttpGet]
            [Route("get-all")]
            public async Task<IActionResult> GetAll()
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel.Data = await _roleService.GetAllAsync();
                return Ok(resultApiModel);
            }

            
            [HttpGet]
            [Route("get-permission-by-role/{userRole}")]
            public async Task<IActionResult> UGetPermissionByRole(UserRole userRole)
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel.Data= await _roleService.GetPermissionByRole(userRole);
                return Ok(resultApiModel);
            }
             [HttpGet]
            [Route("get-permission-by-roleId/{roleId}")]
            public async Task<IActionResult> UGetPermissionByRole(int roleId)
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel.Data= await _roleService.GetPermissionByRole(roleId);
                return Ok(resultApiModel);
            }

            [HttpGet]
            [Route("get/{id}")]
            public async Task<IActionResult> Get(int id)
            {
                ResultApiModel resultApiModel = new ResultApiModel();

                resultApiModel.Data = await _roleService.GetByIdAsync(id);
                resultApiModel.Status = true;
                return Ok(resultApiModel);
            }

   
            [HttpPost]
            [Route("create")]

            public async Task<IActionResult> Create(Role role)
            {
                ResultApiModel resultApiModel = new ResultApiModel();
                if (role == null)
                {
                    return BadRequest("Thiếu thông tin");

                }

                await _roleService.CreateAsync(role);
                return Ok();
            }

            
            [HttpPost]
            [Route("create-role-permission")]

            public async Task<IActionResult> CreateRolePermission(int roleId, int PermissiontionId)
            {
                ResultApiModel resultApiModel = new ResultApiModel();
                resultApiModel = await _roleService.AddRolePermission(roleId, PermissiontionId);
                return Ok(resultApiModel);
            }

            [HttpPut]
            [Route("update")]
            public async Task<IActionResult> Update(Role role)
            {
                ResultApiModel resultApiModel = new ResultApiModel();
                if (role == null)
                {
                    return BadRequest("Thiếu thông tin");

                }
                var old = await _roleService.GetByIdAsync(role.Id);
                if (old == null) return NotFound("Không tìm thấy role");
                
                old.Code = role.Code;
                await _roleService.CreateAsync(old);
                return Ok();
            }
            
            
            [HttpDelete]
            [Route("delete-role-permission")]
            public async Task<IActionResult> DeleteRolePermission(int roleId, int PermissiontionId)
            {
                ResultApiModel resultApiModel = new ResultApiModel();
                resultApiModel = await _roleService.RemoveRolePermission(roleId, PermissiontionId);
                return Ok(resultApiModel);
            }

            [HttpDelete]
            [Route("delete-permission/{permissionId}")]
            public async Task<IActionResult> DeleteRolePermission(int permissionId)
            {
                ResultApiModel resultApiModel = new ResultApiModel();
                resultApiModel = await _roleService.RemveRolePermissionById(permissionId);
                return Ok(resultApiModel);
            }

            [HttpDelete]
            [Route("delete")]
            public async Task<IActionResult> Delete(int id)
            {
                bool result = await _roleService.DeleteAsync(id);
                if (result)
                {
                    return Ok();
                }
                return BadRequest("Không thấy chức năng này hoặc có lỗi trong quá trình xử lý");
            }
        }
    }

