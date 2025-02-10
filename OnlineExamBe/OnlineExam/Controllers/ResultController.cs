using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Interfaces;
using OnlineExam.Domain.Entities;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResultController : ControllerBase
    {
        private readonly IExamService _examService;

        public ResultController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetResultsByStudent(int studentId)
        {
            try
            {
                var results = await _examService.GetResultsByStudentAsync(studentId);
                // Map to DTO if needed, but for now returning entity is fine or map to simple object
                var dtos = results.Select(r => new
                {
                    id = r.ExamId, // Use ExamId as identifier
                    examTitle = r.Exam?.Name ?? "Unknown Exam",
                    objectiveScore = r.Points ?? 0, // Use Points
                    subjectiveScore = 0, // Placeholder
                    totalScore = r.Points ?? 0,
                    status = r.Status.ToString()
                });
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{examId}")]
        public async Task<IActionResult> GetResultDetail(int examId, [FromQuery] int studentId)
        {
            try
            {
                var result = await _examService.GetResultDetailAsync(examId, studentId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
