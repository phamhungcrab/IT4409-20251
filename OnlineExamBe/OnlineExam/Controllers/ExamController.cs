using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.ExamDtos;
using OnlineExam.Application.Dtos.ExamStudent;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.UserDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Application.Services;
using OnlineExam.Attributes;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Infrastructure.Data;
using OnlineExam.Infrastructure.Policy.Requirements;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;
        private readonly IRepository<ExamStudent> _examStudentRepo;
        private readonly IAuthorizationService _authorizationService;
        private readonly IClassService _classService;
        private readonly IExamGradingService _examGradingService;
        private readonly IExamAnswerCache _examAnswerCache;
        private readonly IBackgroundJobClient _backgroundJobClient;
        public ExamController(IExamService examService, IRepository<ExamStudent> examStudentRepo,
                              IAuthorizationService authorizationService,
                              IClassService classService,
                              IExamGradingService examGradingService,
                              IExamAnswerCache examAnswerCache,
                              IBackgroundJobClient backgroundJobClient)
        {
            _examService = examService;
            _examStudentRepo = examStudentRepo;
            _authorizationService = authorizationService;
            _classService = classService;
            _examGradingService = examGradingService;
            _examAnswerCache = examAnswerCache;
            _backgroundJobClient = backgroundJobClient;
        }

        [HttpPost]
        [Route("search-for-admin")]
        [SessionAuthorize]
        public async Task<IActionResult> Search(SearchExamDto search)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _examService.SearchForAdminAsync(search);
            return Ok(apiResultModel);
        }

        [HttpGet("get-all")]
        [SessionAuthorize]
        public async Task<IActionResult> GetAll()
        {
            var exams = await _examService.GetAllAsync();
            return Ok(exams);
        }

        [HttpGet("{id}")]
        [SessionAuthorize("F0522")]

        public async Task<IActionResult> GetById(int id)
        {
            var exam = await _examService.GetByIdAsync(id, ["Class","Class.StudentClasses"]);
            var checkAuth = await _authorizationService.AuthorizeAsync(User, exam.Class, new ResourceRequirement(ResourceAction.ViewDetail));
            if (!checkAuth.Succeeded)
            {
                return Unauthorized("Forbidden: You do not have permission to perform this action.");
            }
            if (exam == null)
                return NotFound("Exam not found");
            exam.Class = null;
            return Ok(exam);
        }

        [HttpPut("update/{id}")]
        [SessionAuthorize("F0513")]
        public async Task<IActionResult> UpdateExam(int id, [FromBody] UpdateExamDto dto)
        {

            var exam = await _examService.GetByIdAsync(id, ["Class", "Class.StudentClasses"]);
            var checkAuth = await _authorizationService.AuthorizeAsync(User, exam.Class, new ResourceRequirement(ResourceAction.Edit));
            if (!checkAuth.Succeeded)
            {
                return Unauthorized("Forbidden: You do not have permission to perform this action.");
            }
            if (exam == null)
                return NotFound("Exam not found");

            exam.Name = dto.Name;
            exam.BlueprintId = dto.BlueprintId;
            exam.ClassId = dto.ClassId;
            exam.DurationMinutes = dto.DurationMinutes;
            exam.StartTime = dto.StartTime;
            exam.EndTime = dto.EndTime;

            await _examService.UpdateAsync(exam);
            exam.Class = null;
            return Ok(new
            {
                message = "Update exam successfully",
                exam
            });
        }

        [HttpDelete("delete/{id}")]
        [SessionAuthorize("F0514")]
        public async Task<IActionResult> DeleteExam(int id)
        {
            var exam = await _examService.GetByIdAsync(id, ["Class"]);
            var checkAuth = await _authorizationService.AuthorizeAsync(User, exam.Class, new ResourceRequirement(ResourceAction.Delete));
            if (!checkAuth.Succeeded)
            {
                return Unauthorized("Forbidden: You do not have permission to perform this action.");
            }
            if (exam == null)
                return NotFound("Exam not found");

            await _examService.DeleteAsync(id);
            return Ok(new
            {
                message = "Delete exam successfully"
            });
        }

        [HttpPost("create-exam")]
        [SessionAuthorize("F0511")]

        public async Task<IActionResult> CreateExam([FromBody] CreateExamForTeacherOrAdmin dto)
        {
            try
            {
                var curClass = await _classService.GetByIdAsync(dto.ClassId);
                if (curClass == null)
                    return BadRequest("Class not found");

                var checkAuth = await _authorizationService.AuthorizeAsync(User, curClass, new ResourceRequirement(ResourceAction.Delete));
                if (!checkAuth.Succeeded)
                {
                    return Unauthorized("Forbidden: You do not have permission to perform this action.");
                }

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

                // Break JSON cycle (EF Core Reference Fixup populates this because curClass is tracked)
                exam.Class = null;

                return Ok(exam);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating exam: {ex.Message} {ex.InnerException?.Message}");
            }
        }

        [HttpPost("start-exam")]
        [SessionAuthorize("F0522")]
        public async Task<IActionResult> StartExam([FromBody] ExamStartRequest dto)
        {
            try
            {
                var req = HttpContext.Request;
                var wsScheme = req.Scheme == "https" ? "wss" : "ws";
                var host = req.Host.Value;
                var websocketUrl = $"{wsScheme}://{host}/ws?examId={dto.ExamId}&studentId={dto.StudentId}";

                var exam = await _examService.GetByIdAsync(dto.ExamId);
                if (exam == null) return BadRequest("Exam not found");


                var c = await _classService.GetByIdAsync(exam.ClassId, ["StudentClasses"]);

                var authResult = await _authorizationService.AuthorizeAsync(User, c, new ResourceRequirement(ResourceAction.StartExam));
                if (!authResult.Succeeded)
                {
                    return Unauthorized("Forbidden: You do not have permission to perform this action.");
                }

                var state = await _examService.GetExamStudent(dto.ExamId, dto.StudentId);

                if (state != null)
                {
                    if (state.Status == ExamStatus.IN_PROGRESS)
                    {
                        var deadline = state.StartTime!.AddMinutes(exam.DurationMinutes);
                        if (DateTime.Now > deadline)
                            return Ok(new { status = "expired" });

                        return Ok(new { status = "in_progress", wsUrl = websocketUrl });
                    }

                    if (state.Status == ExamStatus.COMPLETED)
                    {
                        return Ok(new
                        {
                            status = "completed",
                            data = new ResponseResultExamDto
                            {
                                ExamId = state.ExamId,
                                StudentId = state.StudentId,
                                StartTime = state.StartTime,
                                EndTime = state.EndTime,
                                Status = state.Status
                            }
                        });
                    }

                    return Ok(new { status = "expired" });
                }

                if (DateTime.Now < exam.StartTime)
                    return BadRequest(new { status = "not_started" });

                if (DateTime.Now > exam.EndTime)
                    return BadRequest(new { status = "expired" });

                var examStudent = new ExamStudent
                {
                    ExamId = dto.ExamId,
                    StudentId = dto.StudentId,
                    StartTime = DateTime.Now,
                    Status = ExamStatus.IN_PROGRESS
                };

                var deadlineSubmit = examStudent.StartTime.AddMinutes(exam.DurationMinutes);

                await _examStudentRepo.AddAsync(examStudent);
                await _examStudentRepo.SaveChangesAsync();

                var examForStudent = await _examService.GenerateExamAsync(new CreateExamForStudentDto
                {
                    ExamId = dto.ExamId,
                    StudentId = dto.StudentId
                });

                // hen h nop bai tu dong

                DateTimeOffset scheduledTime = new DateTimeOffset(deadlineSubmit > exam.EndTime ? exam.EndTime : deadlineSubmit);
                string jobId = _backgroundJobClient.Schedule<IExamGradingService>(
                    service => service.GradeAndSaveAsync(dto.ExamId, dto.StudentId),
                    scheduledTime
                    );

                return Ok(new
                {
                    status = "create",
                    wsUrl = websocketUrl,
                    data = examForStudent
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }


        }

        [HttpPost("generate")]
        [SessionAuthorize("F0525")]
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
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("exams/{examId}/current-question")]
        [SessionAuthorize("F0525")]
        public async Task<IActionResult> GetCurrentQuestion(
            int examId,
            [FromQuery] int studentId
        )
        {
            try
            {
                var result = await _examService.GetCurrentQuestionForExam(examId, studentId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message}");
            }

        }

        [HttpGet("detail")]
        [SessionAuthorize("F0525")]
        public async Task<IActionResult> GetExamResultDetail(
            [FromQuery] int examId,
            [FromQuery] int studentId)
        {
            try
            {
                var result = await _examService.GetDetailResultExam(examId, studentId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("exams/{examId}/result-summary")]
        [SessionAuthorize("F0525")]
        public async Task<IActionResult> GetResultSummary(int examId, [FromQuery] int studentId)
        {
            try
            {
                var result = await _examService.GetResultSummary(examId, studentId);return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }


        }

        [HttpGet("student/{studentId}/exams")]
        [SessionAuthorize("F0525")]
        public async Task<IActionResult> GetExamsForStudent(int studentId)
        {
            try
            {
                var result = await _examService.GetListExamForStudent(studentId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message}");
            }

        }

        [HttpGet("{examId}/students-status")]
        [SessionAuthorize("F0512")] // xem thong tin cho quan ly (gv, ad)
        public async Task<IActionResult> GetPreviewScoreStudentsExam(int examId) {
            try
            {
                var result = await _examService.GetPreviewScoreStudentsExam(examId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Records an exam integrity violation (tab switch, fullscreen exit, etc.).
        /// Called by the student's browser when a violation is detected.
        /// </summary>
        [HttpPost("violation")]
        public async Task<IActionResult> RecordViolation([FromBody] RecordViolationDto dto)
        {
            try
            {
                await _examService.RecordViolationAsync(dto);
                return Ok(new { success = true });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to record violation", error = ex.Message });
            }
        }

        /// <summary>
        /// Force submit a student's exam by teacher.
        /// Marks the exam as COMPLETED and calculates the final score.
        /// </summary>
        [HttpPost("force-submit")]
        [SessionAuthorize("F0515")]
        public async Task<IActionResult> ForceSubmit([FromBody] ForceSubmitRequest dto)
        {
            try
            {
                await _examService.ForceSubmitAsync(dto.ExamId, dto.StudentId);
                return Ok(new { success = true, message = "Đã nộp bài thành công" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

/// <summary>
/// Request DTO for force submit
/// </summary>
public class ForceSubmitRequest
{
    public int ExamId { get; set; }
    public int StudentId { get; set; }
}
