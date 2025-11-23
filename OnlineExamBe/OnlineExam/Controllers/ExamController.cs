using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.Exam;
using OnlineExam.Application.Interfaces;
using OnlineExam.Domain.Enums;

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

        [HttpPost("start-exam")]
        public async Task<IActionResult> StartExam([FromBody] ExamStartRequest dto)
        {
            var state = await _examService.GetExamStudentState(dto.ExamId, dto.StudentId);

            if (state != null) {
                if(state == ExamStatus.IN_PROGRESS)
                {

                }
                else if(state == ExamStatus.COMPLETED)
                {

                }
                else if(state == ExamStatus.EXPIRED)
                {

                }
            }

            var exam = await _examService.GenerateExamAsync(new CreateExamDto
            {

            });


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
