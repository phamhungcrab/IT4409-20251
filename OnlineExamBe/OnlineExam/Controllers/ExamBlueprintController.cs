using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Interfaces;
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
        public async Task<IActionResult> Create([FromBody] CreateExamBlueprintDto dto)
        {
            var result = await _examBlueprintService.CreateBlueprintAsync(dto);
            return Ok(result);
        }
    }
}
