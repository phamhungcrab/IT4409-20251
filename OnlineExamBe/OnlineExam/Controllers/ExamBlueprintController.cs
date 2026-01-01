using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.ExamBlueprint;
using OnlineExam.Application.Interfaces;
using OnlineExam.Attributes;
using OnlineExam.Domain.Enums;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamBlueprintController : ControllerBase
    {
        private readonly IExamBlueprintService _examBlueprintService;

        public ExamBlueprintController(IExamBlueprintService examBlueprintService)
        {
            _examBlueprintService = examBlueprintService;
        }

        [HttpPost("create")]
        [SessionAuthorize("F0511")]
        public async Task<IActionResult> Create([FromBody] CreateExamBlueprintDto dto)
        {
            var result = await _examBlueprintService.CreateBlueprintAsync(dto);
            return Ok(result);
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _examBlueprintService.GetAllAsync();
            return Ok(list.Select(b => new
            {
                b.Id,
                b.SubjectId,
                b.CreatedAt
            }));
        }

        [HttpGet("{id}")]
        [SessionAuthorize("F0000")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await _examBlueprintService.GetDetailAsync(id);
            return Ok(result);
        }

        [HttpPut("update/{id}")]
        [SessionAuthorize("F0513")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateExamBlueprintDto dto)
        {
            var result = await _examBlueprintService.UpdateBlueprintAsync(id, dto);
            return Ok(result);
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
    }
}
