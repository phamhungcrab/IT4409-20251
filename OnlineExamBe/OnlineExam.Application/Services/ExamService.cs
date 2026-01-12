using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.ClassDtos;
//using Microsoft.IdentityModel.Tokens;
using OnlineExam.Application.Dtos.ExamDtos;
using OnlineExam.Application.Dtos.ExamStudent;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.SearchClassDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Infrastructure.Policy.Requirements;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.Intrinsics.X86;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class ExamService : CrudService<Exam>, IExamService
    {
        private readonly IRepository<Question> _questionRepo;
        private readonly IRepository<ExamBlueprint> _blueprintRepo;
        private readonly IRepository<QuestionExam> _questionExamRepo;
        private readonly IRepository<ExamStudent> _examStudentRepo;
        private readonly IRepository<StudentQuestion> _studentQuesRepo;
        private readonly IRepository<StudentClass> _studentClassRepo;
        private readonly IRepository<Exam> _exam2Repo;
        private readonly IRepository<ExamStudentViolation> _violationRepo;
        private readonly IAuthorizationService _authorizationService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public ExamService(
            IRepository<Exam> examRepo,
            IRepository<Question> questionRepo,
            IRepository<ExamBlueprint> blueprintRepo,
            IRepository<QuestionExam> questionExamRepo,
            IRepository<StudentQuestion> studentQuesRepo,
            IRepository<ExamStudent> examStudentRepo,
            IRepository<StudentClass> studentClassRepo,
            IRepository<Exam> exam2Repo,
            IRepository<ExamStudentViolation> violationRepo,
            IAuthorizationService authorizationService,
            IHttpContextAccessor httpContextAccessor

            ) : base(examRepo)
        {
            _questionRepo = questionRepo;
            _blueprintRepo = blueprintRepo;
            _questionExamRepo = questionExamRepo;
            _examStudentRepo = examStudentRepo;
            _studentQuesRepo = studentQuesRepo;
            _studentClassRepo = studentClassRepo;
            _exam2Repo = exam2Repo;
            _violationRepo = violationRepo;
            _authorizationService = authorizationService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ResultApiModel> SearchForAdminAsync(SearchExamDto searchModel)
        {
            var query = _repository.Query();
            if (!string.IsNullOrEmpty(searchModel.Name))
            {
                var name = searchModel.Name.ToLower().Trim();
                query = query.Where(c => c.Name.ToLower().Trim().Contains(name));
            }
            if (searchModel.StartTimeFrom != null)
            {
                query = query.Where(c => c.StartTime >= searchModel.StartTimeFrom);
            }

            if (searchModel.StartTimeTo != null)
            {
                query = query.Where(c => c.StartTime <= searchModel.StartTimeTo);
            }
            if (searchModel.EndTimeFrom != null)
            {
                query = query.Where(c => c.EndTime >= searchModel.EndTimeFrom);
            }

            if (searchModel.EndTimeTo != null)
            {
                query = query.Where(c => c.EndTime <= searchModel.EndTimeTo);
            }
            var totalItems = await query.CountAsync();

            var exams = await query
                .Include(C => C.Class)
                .Skip((searchModel.PageNumber - 1) * searchModel.PageSize)
                .Take(searchModel.PageSize)
                .Select(c => new ExamSimpleDto(c))
                .ToListAsync();

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new
                {
                    TotalItems = totalItems,
                    Users = exams
                }
            };

        }
        public async Task<ExamStudent?> GetExamStudent(int examId, int studentId)
        {

            var exis = await _examStudentRepo
                .Query()
                .FirstOrDefaultAsync(x => x.StudentId == studentId && x.ExamId == examId);
            return exis;
        }

        public async Task<ExamStudentsStatusResponse> GetPreviewScoreStudentsExam(int examId)
        {
            var exam = await _exam2Repo.Query()
                .AsNoTracking()
                .Where(e => e.Id == examId)
                .Include(e => e.Class)
                .Include(e => e.Class.StudentClasses)
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.ClassId,
                    e.Class

                })
                .FirstOrDefaultAsync();
            var checkAuth = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, exam.Class, new ResourceRequirement(ResourceAction.View));
            if (!checkAuth.Succeeded)
            {
                throw new UnauthorizedAccessException("Forbidden: You do not have permission.");
            }
            if (exam == null)
                throw new Exception("Exam not found");


            var studentsInClass = await _studentClassRepo.Query()
               .AsNoTracking()
               .Where(sc => sc.ClassId == exam.ClassId)
               .Include(sc => sc.Student)
               .ToListAsync();

            if (!studentsInClass.Any())
            {
                return new ExamStudentsStatusResponse
                {
                    ExamId = exam.Id,
                    ExamName = exam.Name,
                    Students = new List<ExamStudentStatusDto>()
                };
            }

            var examStudents = await _examStudentRepo.Query()
                .AsNoTracking()
                .Where(es => es.ExamId == examId)
                .ToListAsync();

            var examStudentMap = examStudents
                .ToDictionary(es => es.StudentId);

            var students = studentsInClass
                .Where(sc => sc.Student != null)
                .Select(sc => {
                    var student = sc.Student!;
                    examStudentMap.TryGetValue(student.Id, out var es);
                    return new ExamStudentStatusDto {
                        StudentId = student.Id,
                        StudentName = student.FullName,
                        MSSV = student.MSSV,
                        Status = es?.Status,
                        Score = es?.Points,
                        SubmittedAt = es?.EndTime
                    };
                }).ToList();

            return new ExamStudentsStatusResponse {
                ExamId = exam.Id,
                ExamName = exam.Name,
                Students = students
            };
        }

        public async Task<ExamResultSummaryDto> GetResultSummary(int examId, int studentId)
        {
            var exam = await this.GetByIdAsync(examId, ["Class"]);
            if (exam == null)
            {
                throw new Exception("Khong ton tai bai thi");
            }
            var studentQuestions = await _studentQuesRepo.Query()
                .Where(x => x.ExamId == examId && x.StudentId == studentId)
                .ToListAsync();

            var userId = int.Parse(_httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var checkAuth = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, studentId, new ResourceRequirement(ResourceAction.View));
            if (!checkAuth.Succeeded && userId != exam.Class?.TeacherId)
            {
                throw new UnauthorizedAccessException("Forbidden: You do not have permission.");
            }
            // Count violations (always available, even for IN_PROGRESS)
            var violationCount = await _violationRepo.Query()
                .CountAsync(v => v.ExamId == examId && v.StudentId == studentId);

            // If no questions answered yet (early IN_PROGRESS), return partial data
            if (!studentQuestions.Any())
            {
                return new ExamResultSummaryDto
                {
                    ExamId = examId,
                    StudentId = studentId,
                    TotalQuestions = 0,
                    CorrectCount = 0,
                    TotalQuestionPoint = 0,
                    StudentEarnedPoint = 0,
                    FinalScore = 0,
                    ViolationCount = violationCount
                };
            }

            int totalQuestions = studentQuestions.Count;

            int correctCount = studentQuestions.Count(x => x.Result.HasValue && x.Result > 0);

            float totalExamPoint = studentQuestions.Sum(x => x.QuestionPoint);
            float studentEarnedPoint = studentQuestions.Sum(x => x.Result ?? 0);

            // Tính điểm thang 10, làm tròn 0.5
            double rawScore = totalExamPoint == 0 ? 0 : (studentEarnedPoint / totalExamPoint) * 10;

            float finalScore = (float)(Math.Round(rawScore * 2, MidpointRounding.AwayFromZero) / 2);

            return new ExamResultSummaryDto
            {
                ExamId = examId,
                StudentId = studentId,

                TotalQuestions = totalQuestions,
                CorrectCount = correctCount,

                TotalQuestionPoint = totalExamPoint,
                StudentEarnedPoint = studentEarnedPoint,

                FinalScore = finalScore,
                ViolationCount = violationCount
            };
        }

        public async Task RecordViolationAsync(RecordViolationDto dto)
        {
            // Parse violation type
            if (!Enum.TryParse<ViolationType>(dto.ViolationType, ignoreCase: true, out var violationType))
            {
                throw new ArgumentException($"Invalid violation type: {dto.ViolationType}");
            }

            var violation = new ExamStudentViolation
            {
                ExamId = dto.ExamId,
                StudentId = dto.StudentId,
                ViolationType = violationType,
                OccurredAt = dto.OccurredAt,
                DurationMs = dto.DurationMs
            };

            await _violationRepo.AddAsync(violation);
            await _violationRepo.SaveChangesAsync();
        }

        /// <summary>
        /// Force submit a student's exam by teacher.
        /// Sets status to COMPLETED and records end time.
        /// </summary>
        public async Task<bool> ForceSubmitAsync(int examId, int studentId)
        {
            var exam = await this.GetByIdAsync(examId, ["Class"]);
            if (exam == null)
            {
                throw new Exception("Khong ton tai bai thi");
            }

            var userId = int.Parse(_httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if ( userId != exam.Class?.TeacherId)
            {
                throw new UnauthorizedAccessException("Forbidden: You do not have permission.");
            }
            var examStudent = await _examStudentRepo.Query()
                .FirstOrDefaultAsync(es => es.ExamId == examId && es.StudentId == studentId);

            if (examStudent == null)
                throw new Exception("Không tìm thấy bài thi của sinh viên");

            if (examStudent.Status == ExamStatus.COMPLETED)
                throw new Exception("Bài thi đã được nộp trước đó");

            // Calculate score before marking as complete
            var studentQuestions = await _studentQuesRepo.Query()
                .Where(sq => sq.ExamId == examId && sq.StudentId == studentId)
                .ToListAsync();

            float totalExamPoint = studentQuestions.Sum(x => x.QuestionPoint);
            float studentEarnedPoint = studentQuestions.Sum(x => x.Result ?? 0);
            double rawScore = totalExamPoint == 0 ? 0 : (studentEarnedPoint / totalExamPoint) * 10;
            float finalScore = (float)(Math.Round(rawScore * 2, MidpointRounding.AwayFromZero) / 2);

            examStudent.Status = ExamStatus.COMPLETED;
            examStudent.EndTime = DateTime.Now;
            examStudent.Points = finalScore;

            await _examStudentRepo.SaveChangesAsync();
            return true;
        }

        public async Task<ExamResultPreviewDto> GetDetailResultExam(int examId, int studentId)
        {
            var exam = await this.GetByIdAsync(examId, ["Class"]);
            if (exam == null)
                throw new Exception("Không tìm thấy bài thi");

            var userId = int.Parse(_httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var checkAuth = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, studentId, new ResourceRequirement(ResourceAction.View));
            if (!checkAuth.Succeeded && userId != exam.Class?.TeacherId)
            {
                throw new UnauthorizedAccessException("Forbidden: You do not have permission.");
            }
            var examStudent = _examStudentRepo.Query()
                .Where(x => x.ExamId == examId && x.StudentId == studentId)
                .FirstOrDefault();

            if (examStudent == null)
                throw new Exception("Không tìm thấy kết quả làm bài của sinh viên");

            if (examStudent.Status != ExamStatus.COMPLETED)
                throw new Exception("Bài thi chưa được hoàn thành");

            var detailResult = await _studentQuesRepo.Query()
                .Where(x => x.ExamId == examId && x.StudentId == studentId)
                .Include(x => x.QuestionExam!)
                    .ThenInclude(qe => qe.Question)
                .OrderBy(x => x.QuestionExam!.Order)
                .ToListAsync();

            var details = new List<ExamQuestionResultDto>();
            int correctCount = 0;
            float totalExamPoint = 0; //Tổng điểm đề
            float studentEarnedPoint = 0; //Tổng điểm làm được

            foreach (var sq in detailResult)
            {
                var question = sq.QuestionExam!.Question!;
                var questionPoint = question.Point;

                bool isCorrect = sq.Result.HasValue && sq.Result > 0;

                totalExamPoint += questionPoint;

                float earned = isCorrect ? questionPoint : 0;
                studentEarnedPoint += earned;

                if (isCorrect) correctCount++;

                details.Add(new ExamQuestionResultDto
                {
                    QuestionId = question.Id,
                    Order = sq.QuestionExam.Order,

                    Content = question.Content,
                    StudentAnswer = sq.Answer, // Keep raw string (e.g. "A||B")
                    CorrectAnswer = sq.QuestionExam.CorrectAnswer, // Keep raw string (e.g. "A||C")
                    CleanAnswer = CleanAnswer(question.Answer), // List of options ["A", "B", "C", "D"]

                    IsCorrect = isCorrect,
                    QuestionPoint = questionPoint,
                    StudentPoint = earned
                });
            }

            //Tính điểm
            double rawScore = totalExamPoint == 0 ? 0 : (studentEarnedPoint / totalExamPoint) * 10;

            float finalScore = (float)(Math.Round(rawScore * 2, MidpointRounding.AwayFromZero) / 2); //Làm tròn 0.5

            return new ExamResultPreviewDto
            {
                ExamId = exam.Id,
                ExamName = exam.Name,

                StudentId = studentId,

                StartTimeStudent = examStudent.StartTime,
                EndTimeStudent = examStudent.EndTime!.Value,

                StartTimeExam = exam.StartTime,
                EndTimeExam = exam.EndTime,

                DurationMinutes = exam.DurationMinutes,
                TotalPoint = finalScore,
                TotalQuestions = details.Count,
                CorrectCount = correctCount,

                Details = details
            };
        }

        public async Task<IEnumerable<GetListExamForStudentDto>> GetListExamForStudent(int studentId)
        {
            var checkAuth = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, studentId, new ResourceRequirement(ResourceAction.View));
            if (!checkAuth.Succeeded)
            {
                throw new UnauthorizedAccessException("Forbidden: You do not have permission.");
            }

            var classIds = await _studentClassRepo
                .Query()
                .Where(sc => sc.StudentId == studentId)
                .Select(sc => sc.ClassId)
                .ToListAsync();

            if (!classIds.Any())
                return new List<GetListExamForStudentDto>();

            var exams = await _exam2Repo
                .Query()
                .Where(e => classIds.Contains(e.ClassId))
                .Select(e => new
                {
                    Exam = e,
                    StudentExam = e.ExamStudents
                        .FirstOrDefault(es => es.StudentId == studentId)
                })
                .Select(x => new GetListExamForStudentDto
                {
                    ExamId = x.Exam.Id,
                    ExamName = x.Exam.Name,
                    StartTime = x.Exam.StartTime,
                    EndTime = x.Exam.EndTime,
                    DurationMinutes = x.Exam.DurationMinutes,
                    Status = x.StudentExam == null ? null : (ExamStatus?)x.StudentExam.Status,
                    studentStartTime = x.StudentExam == null ? null : x.StudentExam.StartTime,
                    studentEndTime = x.StudentExam == null ? null : x.StudentExam.EndTime

                })
                .OrderBy(e => e.StartTime)
                .ToListAsync();

            return exams;
        }

        public async Task<ExamGenerateResultDto> GetCurrentQuestionForExam(int examId, int studentId)
        {
            var exam = await base.GetByIdAsync(examId, ["Class"]);
            if (exam == null) throw new Exception("Không tồn tại bài thi này");

            var userId = int.Parse(_httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var checkAuth = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, studentId, new ResourceRequirement(ResourceAction.View));
            if (!checkAuth.Succeeded && userId != exam.Class?.TeacherId)
            {
                throw new UnauthorizedAccessException("Forbidden: You do not have permission.");
            }
            var questions = await _questionExamRepo.Query()
                .Where(qe => qe.ExamId == examId && qe.StudentId == studentId)
                .Include(qe => qe.Question)
                .OrderBy(qe => qe.Order)
                .Select(qe => qe.Question!)
                .ToListAsync();

            int order = 1;

            var result = new ExamGenerateResultDto
            {
                ExamId = exam.Id,
                Name = exam.Name,
                TotalQuestions = questions.Count,
                ClassId = exam.ClassId,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                DurationMinutes = exam.DurationMinutes,
                BlueprintId = exam.BlueprintId,

                Questions = questions.Select(q => new GeneratedQuestionDto
                {
                    Id = q.Id,
                    Type = q.Type,
                    Difficulty = q.Difficulty,
                    Order = order++,
                    Content = q.Content,
                    ImageUrl = q.ImageUrl,
                    Point = q.Point,
                    Chapter = q.Chapter,
                    CleanAnswer = CleanAnswer(q.Answer)
                }).ToList()
            };

            return result;
        }

        public async Task<ExamGenerateResultDto> GenerateExamAsync(CreateExamForStudentDto dto)
        {
            var exam = await base.GetByIdAsync(dto.ExamId, ["Class", "Class.StudentClasses"]);


            if (exam == null) throw new Exception("Không tồn tại bài thi này");
            if(!exam.Class.StudentClasses.Select(c => c.StudentId).Contains(dto.StudentId))
            {
                throw new UnauthorizedAccessException("Forbidden: You do not have permission.");
            }
            var checkBlue = await _blueprintRepo
                .Query()
                .Include(x => x.Chapters)
                .FirstOrDefaultAsync(x => x.Id == exam.BlueprintId);

            if (checkBlue == null)
                throw new Exception("Blueprint not found!");

            if (checkBlue.Chapters == null || !checkBlue.Chapters.Any()) throw new Exception("Chapters not found!");

            var chapters = checkBlue.Chapters!.ToList();

            //Lưu danh sách câu hỏi + bảng kết quả
            var questionExams = new List<QuestionExam>();
            var allQuestions = new List<Question>();

            foreach (var ch in chapters)
            {
                var easy = await GetQuestions(checkBlue.SubjectId, ch.Chapter, (int)QuestionDifficulty.Easy, ch.EasyCount);
                var medium = await GetQuestions(checkBlue.SubjectId, ch.Chapter, (int)QuestionDifficulty.Medium, ch.MediumCount);
                var hard = await GetQuestions(checkBlue.SubjectId, ch.Chapter, (int)QuestionDifficulty.Hard, ch.HardCount);
                var veryhard = await GetQuestions(checkBlue.SubjectId, ch.Chapter, (int)QuestionDifficulty.VeryHard, ch.VeryHardCount);

                //Lấy danh sách question
                allQuestions.AddRange(easy);
                allQuestions.AddRange(medium);
                allQuestions.AddRange(hard);
                allQuestions.AddRange(veryhard);

            }

            //Xáo trộn câu hỏi
            allQuestions = allQuestions.OrderBy(x => Guid.NewGuid()).ToList();

            BuildQuestionExam(questionExams, exam, allQuestions, dto.StudentId);


            await _questionExamRepo.AddRangeAsync(questionExams);
            await _questionExamRepo.SaveChangesAsync();

            int order = 1;

            var result = new ExamGenerateResultDto
            {
                ExamId = exam.Id,
                Name = exam.Name,
                TotalQuestions = questionExams.Count,
                ClassId = exam.ClassId,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                DurationMinutes = exam.DurationMinutes,
                BlueprintId = exam.BlueprintId,

                Questions = allQuestions.Select(q => new GeneratedQuestionDto
                {
                    Id = q.Id,
                    Type = q.Type,
                    Difficulty = q.Difficulty,
                    Order = order++,
                    Content = q.Content,
                    ImageUrl = q.ImageUrl,
                    Point = q.Point,
                    Chapter = q.Chapter,
                    CleanAnswer = CleanAnswer(q.Answer)
                }).ToList()
            };

            return result;
        }

        private async Task<List<Question>> GetQuestions(
            int subjectId,
            int chapter,
            int difficulty,
            int count
            )
        {
            var questions = await _questionRepo
                .FindAsync(q =>
                q.SubjectId == subjectId &&
                q.Chapter == chapter &&
                (int)q.Difficulty == difficulty);

            return questions
                .OrderBy(_ => Guid.NewGuid())
                .Take(count)
                .ToList();
        }

        private void BuildQuestionExam(List<QuestionExam> list, Exam? exam, List<Question> questions, int StudentId)
        {
            int order = 1;

            if (exam == null) throw new Exception("Không tìm thấy bài thi from build");
            foreach (var q in questions)
            {
                list.Add(new QuestionExam
                {
                    ExamId = exam.Id,
                    QuestionId = q.Id,
                    StudentId = StudentId,
                    CorrectAnswer = GetCorrectAnswer(q.Answer), // Lấy correct từ chuỗi
                    Point = q.Point,
                    Order = order++
                });
            }
        }

        private string GetCorrectAnswer(string list)
        {
            if (string.IsNullOrWhiteSpace(list))
                return "";

            var correctAnswers = list
                            .Split(new[] { "||", "|", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(p => p.Trim())
                            .Where(p => p.EndsWith("*"))
                            .Select(p => p.TrimEnd('*').Trim())
                            .Where(p => p.Length > 0)
                            .Select(p => p.ToLowerInvariant()) // chuẩn hoá lowercase
                            .Distinct(StringComparer.InvariantCultureIgnoreCase)
                            .OrderBy(p => p, StringComparer.InvariantCultureIgnoreCase)
                            .ToList();

            return string.Join("||", correctAnswers);
        }

        private List<string> CleanAnswer(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return new List<string>();

            return raw.Split(new[] { "||", "|", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries)
                      .Select(x => x.Trim().TrimEnd('*').Trim())
                      .Where(x => !string.IsNullOrEmpty(x))
                      .ToList();
        }
    }
}
