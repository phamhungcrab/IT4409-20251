using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Application.Services.Helpers;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services.Websocket
{
    public class ExamGradingService : IExamGradingService
    {
        private readonly IExamAnswerCache _cache;
        private readonly IRepository<QuestionExam> _questionExamRepo;
        private readonly IRepository<StudentQuestion> _studentQuestionRepo;
        private readonly IRepository<ExamStudent> _examStudentRepo;

        public ExamGradingService(
            IExamAnswerCache cache,
            IRepository<QuestionExam> questionExamRepo,
            IRepository<StudentQuestion> studentQuestionRepo,
            IRepository<ExamStudent> examStudentRepo)
        {
            _cache = cache;
            _questionExamRepo = questionExamRepo;
            _studentQuestionRepo = studentQuestionRepo;
            _examStudentRepo = examStudentRepo;
        }

        public async Task<GradeResult> GradeAndSaveAsync(int examId, int studentId)
        {
            var cacheAnswers = _cache.GetAnswers(examId, studentId)
                .ToDictionary(x => x.QuestionId, x => x.Answer ?? string.Empty);

            var questionExams = await _questionExamRepo
                .Query()
                .Include(qe => qe.Question)
                .Where(x => x.ExamId == examId && x.StudentId == studentId)
                .ToListAsync();

            // Fallback: nếu không có bộ câu hỏi riêng cho student, dùng bộ theo exam
            if (questionExams.Count == 0)
            {
                questionExams = await _questionExamRepo
                    .Query()
                    .Include(qe => qe.Question)
                    .Where(x => x.ExamId == examId)
                    .ToListAsync();
            }

            // Tránh double-count khi dùng bộ câu hỏi chung (nhiều StudentId)
            questionExams = questionExams
                .GroupBy(qe => qe.QuestionId)
                .Select(g => g.First())
                .ToList();

            if (questionExams.Count == 0)
            {
                Console.WriteLine($"[GRADING] No QuestionExams for exam={examId} student={studentId}");
                return new GradeResult(0, 0);
            }

            var existingStudentAnswers = await _studentQuestionRepo
                .Query()
                .Where(x => x.ExamId == examId && x.StudentId == studentId)
                .ToListAsync();

            var existingByQuestion = existingStudentAnswers.ToDictionary(x => x.QuestionId, x => x);

            float totalScore = 0;
            float maxScore = questionExams.Sum(qe => qe.Point);
            bool updatedCorrect = false;
            var toInsert = new List<StudentQuestion>();


            static List<string> ParseTokens(string value)
            {
                if (string.IsNullOrWhiteSpace(value)) return new List<string>();
                return value.Split('|', StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim().ToLowerInvariant())
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(t => t, StringComparer.OrdinalIgnoreCase)
                    .ToList();
            }

            foreach (var qe in questionExams)
            {

                cacheAnswers.TryGetValue(qe.QuestionId, out string? studentAnswerRaw);
                if (string.IsNullOrWhiteSpace(studentAnswerRaw) && existingByQuestion.TryGetValue(qe.QuestionId, out var existingRow))
                {
                    studentAnswerRaw = existingRow.Answer ?? string.Empty;
                }
                studentAnswerRaw ??= string.Empty;

                var correctTokens = ParseTokens(qe.CorrectAnswer ?? string.Empty);
                if (correctTokens.Count == 0)
                {
                    var source = qe.Question?.Answer ?? string.Empty;
                    correctTokens = source.Contains("*") ? AnswerParser.ParseCorrectTokens(source) : ParseTokens(source);

                    var normalizedCorrect = AnswerParser.NormalizeTokens(correctTokens);
                    if (!string.IsNullOrWhiteSpace(normalizedCorrect) && !string.Equals(qe.CorrectAnswer, normalizedCorrect, StringComparison.OrdinalIgnoreCase))
                    {
                        qe.CorrectAnswer = normalizedCorrect;
                        _questionExamRepo.UpdateAsync(qe);
                        updatedCorrect = true;
                    }
                    correctTokens = ParseTokens(qe.CorrectAnswer ?? string.Empty);
                }

                var studentTokens = ParseTokens(studentAnswerRaw);

                bool isCorrect = correctTokens.Count > 0 && correctTokens.Count == studentTokens.Count && !correctTokens.Except(studentTokens, StringComparer.OrdinalIgnoreCase).Any();

                Console.WriteLine($"[GRADING] exam={examId} student={studentId} q={qe.QuestionId} correct=[{string.Join("|", correctTokens)}] student=[{string.Join("|", studentTokens)}] => {(isCorrect ? "OK" : "FAIL")}");

                if (isCorrect)
                    totalScore += qe.Point;

                if (existingByQuestion.TryGetValue(qe.QuestionId, out var existed))
                {
                    existed.Answer = studentAnswerRaw;
                    existed.Result = isCorrect ? qe.Point : 0;
                    existed.CreatedAt = DateTime.Now;
                    _studentQuestionRepo.UpdateAsync(existed);
                }
                else
                {
                    toInsert.Add(new StudentQuestion
                    {
                        ExamId = examId,
                        StudentId = studentId,
                        QuestionId = qe.QuestionId,
                        Answer = studentAnswerRaw,
                        Result = isCorrect ? qe.Point : 0,
                        CreatedAt = DateTime.Now
                    });
                }

            }

            if (toInsert.Count > 0)
            {
                await _studentQuestionRepo.AddRangeAsync(toInsert);
            }
            await _studentQuestionRepo.SaveChangesAsync();

            if (updatedCorrect)
            {
                await _questionExamRepo.SaveChangesAsync();
            }

            var examStudent = await _examStudentRepo
                .Query()
                .FirstOrDefaultAsync(x => x.ExamId == examId && x.StudentId == studentId);

            if (examStudent != null)
            {
                examStudent.EndTime = DateTime.Now;
                examStudent.Status = ExamStatus.COMPLETED;
                examStudent.Points = totalScore;

                _examStudentRepo.UpdateAsync(examStudent);
                await _examStudentRepo.SaveChangesAsync();
            }
            else { throw new Exception("Khong tim thay bang tien trinh lam bai"); }

            _cache.Clear(examId, studentId);

            return new GradeResult(totalScore, maxScore);
        }
    }
}
