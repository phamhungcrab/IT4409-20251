using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Interfaces.Websocket;
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

        public async Task<float> GradeAndSaveAsync(int examId, int studentId)
        {
            var answers = _cache.GetAnswers(examId, studentId)
                .ToDictionary(x => x.QuestionId, x => x.Answer ?? "");

            var correctList = await _questionExamRepo
                .Query()
                .Where(x => x.ExamId == examId && x.StudentId == studentId)
                .ToListAsync();

            float totalScore = 0;
            float totalScoreExam = 0;
            var saveList = new List<StudentQuestion>();

            foreach (var qe in correctList)
            {
                answers.TryGetValue(qe.QuestionId, out string? studentAnswer);

                studentAnswer = studentAnswer ?? "";

                string normalizedStudentAnswer = NormalizeAnswer(studentAnswer);

                totalScoreExam += qe.Point;

                bool isCorrect = CheckMultipleCorrect(qe.CorrectAnswer, normalizedStudentAnswer);

                if (isCorrect)
                    totalScore += qe.Point;

                saveList.Add(new StudentQuestion
                {
                    ExamId = examId,
                    StudentId = studentId,
                    QuestionId = qe.QuestionId,
                    Answer = normalizedStudentAnswer,      
                    Result = isCorrect ? qe.Point : 0,
                    CreatedAt = DateTime.Now,
                    QuestionPoint = qe.Point
                });
            }

            await _studentQuestionRepo.AddRangeAsync(saveList);
            await _studentQuestionRepo.SaveChangesAsync();

            //Lưu bảng kết quả
            var examStudent = await _examStudentRepo
                .Query()
                .FirstOrDefaultAsync(x => x.ExamId == examId && x.StudentId == studentId);

            double rawScore = totalScoreExam == 0 ? 0 : (totalScore / totalScoreExam) * 10;

            float finalScore = (float)(Math.Round(rawScore * 2, MidpointRounding.AwayFromZero) / 2);


            if (examStudent != null)
            {
                examStudent.EndTime = DateTime.Now;
                examStudent.Status = ExamStatus.COMPLETED;
                examStudent.Points = finalScore;

                _examStudentRepo.UpdateAsync(examStudent);
                await _examStudentRepo.SaveChangesAsync();
            }
            else
            {
                throw new Exception("Không tìm thấy bảng tiến trình làm bài");
            }

            _cache.Clear(examId, studentId);

            return totalScore;
        }

        private bool CheckMultipleCorrect(string correct, string student)
        {
            return string.Equals(correct, student, StringComparison.Ordinal);
        }

        private string NormalizeAnswer(string answer)
        {
            if (string.IsNullOrWhiteSpace(answer))
                return "";

            var parts = answer
                .Split('|', StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .Where(p => p.Length > 0)
                .Select(p => p.ToLowerInvariant())
                .Distinct(StringComparer.InvariantCultureIgnoreCase)
                .OrderBy(p => p, StringComparer.InvariantCultureIgnoreCase)
                .ToList();

            return string.Join("|", parts);
        }

    }
}
