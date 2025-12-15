using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.Result;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResultController : ControllerBase
    {
        private readonly IRepository<ExamStudent> _examStudentRepo;
        private readonly IRepository<Exam> _examRepo;
        private readonly IRepository<QuestionExam> _questionExamRepo;
        private readonly IRepository<StudentQuestion> _studentQuestionRepo;

        public ResultController(
            IRepository<ExamStudent> examStudentRepo,
            IRepository<Exam> examRepo,
            IRepository<QuestionExam> questionExamRepo,
            IRepository<StudentQuestion> studentQuestionRepo)
        {
            _examStudentRepo = examStudentRepo;
            _examRepo = examRepo;
            _questionExamRepo = questionExamRepo;
            _studentQuestionRepo = studentQuestionRepo;
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(int studentId)
        {
            var results = await _examStudentRepo
                .Query()
                .Where(es => es.StudentId == studentId)
                .Join(_examRepo.Query(),
                    es => es.ExamId,
                    e => e.Id,
                    (es, e) => new { es, e })
                .Select(x => new StudentResultDto
                {
                    ExamId = x.e.Id,
                    ExamName = x.e.Name ?? $"Exam {x.e.Id}",
                    Score = x.es.Points ?? 0,
                    Status = x.es.Status,
                    SubmittedAt = x.es.EndTime
                })
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet("detail")]
        public async Task<IActionResult> GetDetail(int studentId, int examId)
        {
            var examStudent = await _examStudentRepo
                .Query()
                .Include(es => es.Exam)
                .FirstOrDefaultAsync(es => es.StudentId == studentId && es.ExamId == examId);

            if (examStudent == null) return NotFound("Không tìm thấy kết quả bài thi.");

            var questionExams = await _questionExamRepo
                .Query()
                .Include(qe => qe.Question)
                .Where(qe => qe.ExamId == examId)
                .ToListAsync();

            // Ensure uniqueness by QuestionId
            questionExams = questionExams
                .GroupBy(q => q.QuestionId)
                .Select(g => g.First())
                .ToList();

            var studentAnswers = await _studentQuestionRepo
                .Query()
                .Where(sq => sq.ExamId == examId && sq.StudentId == studentId)
                .ToListAsync();

            var answersByQuestion = studentAnswers.ToDictionary(x => x.QuestionId, x => x);

            int totalQuestions = questionExams.Count;
            float maxScore = questionExams.Sum(qe => qe.Point);
            float totalScore = 0;
            int correctCount = 0;

            var questionResults = new List<QuestionResultDto>();

            foreach (var qe in questionExams)
            {
                var correctTokens = SplitTokens(qe.CorrectAnswer);
                answersByQuestion.TryGetValue(qe.QuestionId, out var sqRow);
                var studentRaw = sqRow?.Answer ?? string.Empty;
                var studentTokens = SplitTokens(studentRaw);

                bool isCorrect = correctTokens.Count > 0 &&
                                 correctTokens.Count == studentTokens.Count &&
                                 !correctTokens.Except(studentTokens, StringComparer.OrdinalIgnoreCase).Any();

                var earned = isCorrect ? qe.Point : 0;
                if (isCorrect) correctCount++;
                totalScore += earned;

                questionResults.Add(new QuestionResultDto
                {
                    QuestionId = qe.QuestionId,
                    QuestionContent = qe.Question?.Content ?? string.Empty,
                    StudentAnswer = studentRaw,
                    CorrectAnswer = string.Join("|", correctTokens),
                    Point = qe.Point,
                    Earned = earned
                });

                // update per-question result if row exists
                if (sqRow != null)
                {
                    sqRow.Result = earned;
                    _studentQuestionRepo.UpdateAsync(sqRow);
                }
            }

            await _studentQuestionRepo.SaveChangesAsync();

            var dto = new ResultDetailDto
            {
                ExamId = examId,
                ExamName = examStudent.Exam?.Name ?? $"Exam {examId}",
                Status = examStudent.Status,
                StartTime = examStudent.StartTime,
                EndTime = examStudent.EndTime,
                TotalScore = totalScore,
                MaxScore = maxScore,
                TotalQuestions = totalQuestions,
                CorrectCount = correctCount,
                Percentage = maxScore > 0 ? Math.Round(totalScore / maxScore * 100, 2) : 0,
                Questions = questionResults
            };

            return Ok(dto);
        }

        private static List<string> SplitTokens(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return new List<string>();
            return value.Split('|', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim().ToLowerInvariant())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(t => t, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }
}
