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
            var answers = _cache.GetAnswers(examId, studentId);

            var correctList = await _questionExamRepo
                .Query()
                .Where(x => x.ExamId == examId && x.StudentId == studentId)
                .Include(x => x.Question)
                .ToListAsync();

            float totalScore = 0;
            var saveList = new List<StudentQuestion>();

            foreach (var a in answers)
            {
                var qe = correctList.FirstOrDefault(x => x.QuestionId == a.QuestionId);
                if (qe == null) continue;
                else
                {
                    bool isCorrect = string.Equals(
                    qe.CorrectAnswer.Trim(),
                    a.Answer.Trim(),
                    StringComparison.OrdinalIgnoreCase);

                    if (isCorrect) totalScore += qe.Point;

                    saveList.Add(new StudentQuestion
                    {
                        ExamId = examId,
                        StudentId = studentId,
                        QuestionId = a.QuestionId,
                        Answer = a.Answer,
                        Result = isCorrect ? qe.Point : 0
                    });
                }
            }

            await _studentQuestionRepo.AddRangeAsync(saveList);
            await _studentQuestionRepo.SaveChangesAsync();

            //Lưu bảng kết quả
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
            else
            {
                throw new Exception("Không tìm thấy bảng tiến trình làm bài");
            }

            _cache.Clear(examId, studentId);

            return totalScore;
        }
    }
}
