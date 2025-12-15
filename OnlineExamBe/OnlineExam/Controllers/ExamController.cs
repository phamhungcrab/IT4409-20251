using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using OnlineExam.Application.Dtos.Exam;
using OnlineExam.Application.Dtos.ExamStudent;
using OnlineExam.Application.Interfaces;
using OnlineExam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
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
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        public ExamController(
            IExamService examService,
            IRepository<ExamStudent> examStudentRepo,
            IConfiguration configuration,
            IWebHostEnvironment env)
        {
            _examService = examService;
            _examStudentRepo = examStudentRepo;
            _configuration = configuration;
            _env = env;
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
            try
            {
                var websocketUrl = BuildWebSocketUrl(dto.ExamId, dto.StudentId);

                var state = await _examService.GetExamStudent(dto.ExamId, dto.StudentId);
                var exam = await _examService.GetByIdAsync(dto.ExamId);

                if (exam == null) return BadRequest("Exam not found");

                // Chuẩn hóa thời gian UTC để tránh auto-submit do lệch múi giờ
                var examStartUtc = ToUtc(exam.StartTime);
                var examEndUtc = ToUtc(exam.EndTime);
                var now = DateTime.UtcNow;
                var durationSeconds = Math.Max(60, exam.DurationMinutes * 60);

                // Nếu hết hạn thi -> trả expired và cập nhật trạng thái
                if (now > examEndUtc)
                {
                    if (state != null && state.Status != ExamStatus.COMPLETED)
                    {
                        state.Status = ExamStatus.EXPIRED;
                        _examStudentRepo.UpdateAsync(state);
                        await _examStudentRepo.SaveChangesAsync();
                    }

                    return Ok(new { status = "expired" });
                }

                // Nếu chưa đến giờ mở đề
                if (now < examStartUtc)
                {
                    return Ok(new
                    {
                        status = "not_started",
                        startTime = examStartUtc
                    });
                }

                if (state != null)
                {
                    // Normalize start time to UTC to avoid negative remaining time caused by local/unspecified DateTime
                    if (state.StartTime.Kind == DateTimeKind.Unspecified)
                    {
                        state.StartTime = DateTime.SpecifyKind(state.StartTime, DateTimeKind.Utc);
                        _examStudentRepo.UpdateAsync(state);
                        await _examStudentRepo.SaveChangesAsync();
                    }
                    else if (state.StartTime.Kind == DateTimeKind.Local)
                    {
                        state.StartTime = state.StartTime.ToUniversalTime();
                        _examStudentRepo.UpdateAsync(state);
                        await _examStudentRepo.SaveChangesAsync();
                    }

                    if (state.Status == ExamStatus.IN_PROGRESS)
                    {
                        // Nếu bản ghi cũ có StartTime quá xa (hoặc chưa từng làm), cho phép bắt đầu lại trong khung Start/End
                        var needsResetStart =
                            state.StartTime < examStartUtc || // start cũ trước thời gian mở đề
                            state.StartTime > examEndUtc ||   // start cũ sau thời gian kết thúc (data lỗi)
                            (now - state.StartTime).TotalSeconds > durationSeconds; // đã vượt duration nhưng đề vẫn còn hạn

                        if (needsResetStart)
                        {
                            state.StartTime = now;
                            state.Status = ExamStatus.IN_PROGRESS;
                            _examStudentRepo.UpdateAsync(state);
                            await _examStudentRepo.SaveChangesAsync();
                        }

                        var endDeadline = MinDate(state.StartTime.AddSeconds(durationSeconds), examEndUtc);
                        if (now >= endDeadline)
                        {
                            state.Status = ExamStatus.EXPIRED;
                            _examStudentRepo.UpdateAsync(state);
                            await _examStudentRepo.SaveChangesAsync();

                            return Ok(new { status = "expired" });
                        }

                        var examForStudent = await _examService.GenerateExamAsync(new CreateExamForStudentDto
                        {
                            ExamId = dto.ExamId,
                            StudentId = dto.StudentId,
                            DurationMinutes = exam.DurationMinutes,
                            StartTime = exam.StartTime,
                            EndTime = exam.EndTime,
                        });

                        return Ok(new
                        {
                            status = "in_progress",
                            wsUrl = websocketUrl,
                            data = examForStudent
                        });
                    }
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
                    else if (state.Status == ExamStatus.EXPIRED)
                    {
                        return Ok(new
                        {
                            status = "expired"
                        });
                    }
                    else return BadRequest("Status khong hop le");
                }
                else
                {
                    var examStudent = new ExamStudent
                    {
                        ExamId = dto.ExamId,
                        StudentId = dto.StudentId,
                        StartTime = now,
                        Status = ExamStatus.IN_PROGRESS
                    };

                    await _examStudentRepo.AddAsync(examStudent);
                    await _examStudentRepo.SaveChangesAsync();

                    var examForStudent = await _examService.GenerateExamAsync(new CreateExamForStudentDto
                    {
                        ExamId = dto.ExamId,
                        StudentId = dto.StudentId,
                        DurationMinutes = exam.DurationMinutes,
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
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"[StartExam][DbUpdateException] {dbEx} | Inner: {dbEx.InnerException?.Message}");
                return StatusCode(500, new
                {
                    error = dbEx.Message,
                    inner = dbEx.InnerException?.Message,
                    stackTrace = dbEx.StackTrace
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[StartExam][Exception] {ex} | Inner: {ex.InnerException?.Message}");
                return StatusCode(500, new
                {
                    error = ex.Message,
                    inner = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("get-by-student")]
        public async Task<IActionResult> GetByStudent(int studentId)
        {
            try
            {
                var exams = await _examService.GetExamsByStudentId(studentId);
                return Ok(exams);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var exams = await _examService.GetAllAsync();
                return Ok(exams);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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

        private string BuildWebSocketUrl(int examId, int studentId)
        {
            var req = HttpContext.Request;

            // Allow explicit override via config to avoid leaking FE dev port (5173/8081) into wsUrl
            var configuredBase = _env.IsDevelopment()
                ? _configuration.GetValue<string>("WebSocket:DevBaseUrl")
                : _configuration.GetValue<string>("WebSocket:PublicBaseUrl");

            string wsBase = string.IsNullOrWhiteSpace(configuredBase)
                ? string.Empty
                : configuredBase.TrimEnd('/');

            if (string.IsNullOrEmpty(wsBase))
            {
                var host = req.Host;
                var wsScheme = req.IsHttps ? "wss" : "ws";

                // When coming from local dev hosts (including Vite proxies), force the known backend port to avoid self-signed cert problems
                if (string.Equals(host.Host, "localhost", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(host.Host, "127.0.0.1"))
                {
                    var localPort = _configuration.GetValue<int?>("WebSocket:LocalPort") ?? 7238;
                    var localHost = _configuration.GetValue<string>("WebSocket:LocalHost") ?? "localhost";

                    host = new HostString(localHost, localPort);
                    wsScheme = "ws";
                }

                wsBase = $"{wsScheme}://{host.Value}";
            }

            return $"{wsBase}/ws?examId={examId}&studentId={studentId}";
        }

        private static DateTime ToUtc(DateTime dt)
        {
            return dt.Kind switch
            {
                DateTimeKind.Utc => dt,
                DateTimeKind.Local => dt.ToUniversalTime(),
                _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
            };
        }

        private static DateTime MinDate(DateTime a, DateTime b) => a <= b ? a : b;
    }
}

