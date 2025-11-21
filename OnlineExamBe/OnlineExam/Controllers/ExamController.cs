using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.Exam;
using OnlineExam.Application.Interfaces;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;
        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] CreateExamDto dto)
        {
            try
            {
                var exam = await _examService.GenerateExamAsync(dto);
                return Ok(new
                {
                    message = "Generated OK",
                    exam = exam
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
