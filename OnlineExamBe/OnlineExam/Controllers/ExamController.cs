using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.Exam;
using OnlineExam.Application.Dtos.ExamStudent;
using OnlineExam.Application.Interfaces;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;
        private readonly IRepository<ExamStudent> _examStudentRepo;
        public ExamController(IExamService examService , IRepository<ExamStudent> examStudentRepo)
        {
            _examService = examService;
            _examStudentRepo = examStudentRepo;
        }

        [HttpPost("create-exam")]
        public async Task<IActionResult> CreateExam([FromBody] CreateExamForTeacherOrAdmin dto)
        {
            try
            {
                var exam = new Exam
                {
                    Name = dto.Name,
                    BlueprintId = dto.BlueprintId,
                    ClassId = dto.ClassId,
                    DurationMinutes = dto.DurationMinutes,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime
                };

                await _examService.CreateAsync(exam);
                return Ok(exam);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("start-exam")]
        public async Task<IActionResult> StartExam([FromBody] ExamStartRequest dto)
        {
            var websocketUrl = $"wss://localhost:7239/ws?examId={dto.ExamId}&studentId={dto.StudentId}";

            var state = await _examService.GetExamStudent(dto.ExamId, dto.StudentId);
            var exam = await _examService.GetByIdAsync(dto.ExamId);

            if (exam == null) return BadRequest("Exam not found");

            if (state != null)
            {
                if (state.Status == ExamStatus.IN_PROGRESS)
                {
                    return Ok(new
                    {
                        status = "in_progress",
                        wsUrl = websocketUrl
                    });
                }


                //Trả kết quả
                else if (state.Status == ExamStatus.COMPLETED)
                {
                    var result = new ResponseResultExamDto
                    {
                        ExamId = state.ExamId,
                        StudentId = state.StudentId,
                        StartTime = state.StartTime,
                        EndTime = state.EndTime,
                        Points = state.Points,
                        Status = state.Status
                    };
                    return Ok(new
                    {
                        status = "completed",
                        data = result
                    });
                }

                //Hết hạn
                else if (state.Status == ExamStatus.EXPIRED)
                {
                    return Ok(new
                    {
                        status = "expired"
                    });
                }
                else return BadRequest("Không có status bài thi tương ứng");
            }
            else
            {
                var examStudent = new ExamStudent
                {
                    ExamId = dto.ExamId,
                    StudentId = dto.StudentId,
                    StartTime = DateTime.Now,
                    Status = ExamStatus.IN_PROGRESS
                };

                await _examStudentRepo.AddAsync(examStudent);
                await _examStudentRepo.SaveChangesAsync();

                var examForStudent = await _examService.GenerateExamAsync(new CreateExamForStudentDto
                {
                    ExamId = dto.ExamId,
                    StudentId = dto.StudentId,
                    DurationMinutes = dto.DurationMinutes,
                    StartTime = exam.StartTime,
                    EndTime = exam.EndTime,
                });
                return Ok(new
                {   
                    status = "create",
                    wsUrl = websocketUrl,
                    data = examForStudent
                });
            }
                
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] CreateExamForStudentDto dto)
        {
            try
            {
                var exam = await _examService.GenerateExamAsync(dto);
                return Ok(new
                {
                    message = "Generated OK",
                    exam
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
