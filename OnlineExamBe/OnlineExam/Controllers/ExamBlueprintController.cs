using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.ExamBlueprint;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services;
using OnlineExam.Attributes;
using OnlineExam.Domain.Enums;
using OnlineExam.Infrastructure.Policy.Requirements;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamBlueprintController : ControllerBase
    {
        private readonly IExamBlueprintService _examBlueprintService;

        private readonly IAuthorizationService _authorizationService;
        private readonly IClassService _classService;
        public ExamBlueprintController(IExamBlueprintService examBlueprintService,
                                        IAuthorizationService authorizationService,
                                        IClassService classService)
        {
            _examBlueprintService = examBlueprintService;
            _authorizationService = authorizationService;
            _classService = classService;
        }

        [HttpPost("create")]
        [SessionAuthorize("F0511")]
        public async Task<IActionResult> Create([FromBody] CreateExamBlueprintDto dto)
        {
            try
            {
                var result = await _examBlueprintService.CreateBlueprintAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _examBlueprintService.GetAllViewAsync();
            return Ok(list);
        }

        [HttpGet("{id}")]
        [SessionAuthorize("F0000")]
        public async Task<IActionResult> GetDetail(int id)
        {
            try
            {
                var result = await _examBlueprintService.GetDetailAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            } 
        }

        [HttpPut("update/{id}")]
        [SessionAuthorize("F0513")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateExamBlueprintDto dto)
        {
            try
            {
                var result = await _examBlueprintService.UpdateBlueprintAsync(id, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            } 
        }

        [HttpDelete("delete/{id}")]
        [SessionAuthorize("F0514")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _examBlueprintService.DeleteAsync(id);
                return Ok("Deleted");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }

        [HttpGet("by-class/{classId}")]
        public async Task<IActionResult> GetByClass(int classId)
        {
            var curClass = await _classService.GetByIdAsync(classId, ["StudentClasses"]);

            var checkAuth = await _authorizationService.AuthorizeAsync(User, curClass, new ResourceRequirement(ResourceAction.View));
            if (!checkAuth.Succeeded)
            {
                return Unauthorized("Forbidden: You do not have permission to perform this action.");
            }
            try
            {
                var result = await _examBlueprintService.GetExamsWithBlueprintByClassAsync(classId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}
