using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.GroupPermissionDtos;
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
    public class GroupPermissionController : Controller
    {
        private IGroupPermissionService _groupPermissionService;
        public GroupPermissionController(IGroupPermissionService groupPermissionService) 
        {
            _groupPermissionService = groupPermissionService;
        }

        /// <summary>
        /// tra ve danh sach group Permission
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("get-all")]
        public async Task<IActionResult> GetAll()
        {
            ResultApiModel resultApiModel = new ResultApiModel();
            var groupPer = await _groupPermissionService.GetAllAsync("ListChildPermission");

            resultApiModel.Data = groupPer.Select(c => new GroupPermissionDto(c));
            return Ok(resultApiModel);
        }

        [HttpGet]
        [Route("get/{id}")]
        public async Task<IActionResult> Get(int id)
        {
            ResultApiModel resultApiModel = new ResultApiModel();
            var groupPer = await _groupPermissionService.GetByIdAsync(id, ["ListChildPermission"]);
            if (groupPer == null) 
            {
                resultApiModel.Status = false;
                return NotFound(resultApiModel);
                
            }
            resultApiModel.Data = new GroupPermissionDto(groupPer);

            resultApiModel.Status = true;
            return Ok(resultApiModel);
        }

        [HttpPost]
        [Route("create")]

        public async Task<IActionResult> Create(CreateGroupPermissionDto groupPermission)
        {
            ResultApiModel resultApiModel = new ResultApiModel();
            if (groupPermission == null) 
            {
                return BadRequest("Thiếu thông tin");

            }

               return Ok(await _groupPermissionService.Create(groupPermission));
            
        }

        [HttpPut]
        [Route("update")]
        public async Task<IActionResult> Update(UpdateGroupPermissionDto groupPermission)
        {
            ResultApiModel resultApiModel = new ResultApiModel();
            if (groupPermission == null)
            {
                return BadRequest("Thiếu thông tin");

            }
            
            return Ok(await _groupPermissionService.Update(groupPermission));
        }
        [HttpDelete]
        [Route("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            bool result = await _groupPermissionService.DeleteAsync(id);
            if (result) 
            {
                return Ok();
            }
            return BadRequest("Không thấy nhóm chức năng này hoặc có lỗi trong quá trình xử lý");
        }

    }
}
