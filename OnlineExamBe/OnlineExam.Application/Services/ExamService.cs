using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineExam.Application.Dtos.Exam;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class ExamService : CrudService<Exam>, IExamService
    {
        private readonly IRepository<Question> _questionRepo;
        private readonly IRepository<ExamBlueprint> _blueprintRepo;
        private readonly IRepository<QuestionExam> _questionExamRepo;

        public ExamService(
            IRepository<Exam> examRepo,
            IRepository<Question> questionRepo,
            IRepository<ExamBlueprint> blueprintRepo,
            IRepository<QuestionExam> questionExamRepo
            ) : base(examRepo)
        {
            _questionRepo = questionRepo;
            _blueprintRepo = blueprintRepo;
            _questionExamRepo = questionExamRepo;
        }


        public async Task<Exam?> GenerateExamAsync(CreateExamDto dto)
        {
            var checkBlue = await _blueprintRepo
                .Query()
                .Include(x => x.Chapters)
                .FirstOrDefaultAsync(x => x.Id == dto.BlueprintId);

            if (checkBlue == null)
                throw new Exception("Blueprint not found!");

            if (checkBlue.Chapters.IsNullOrEmpty()) throw new Exception("Chapters not found!");

            var chapters = checkBlue.Chapters!.ToList();

            var exam = new Exam
            {
                Name = dto.Name,
                BlueprintId = dto.BlueprintId,
                ClassId = dto.ClassId,
                DurationMinutes = dto.DurationMinutes,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime
            };

            await base.CreateAsync(exam);

            var questionExams = new List<QuestionExam>();

            foreach (var ch in chapters)
            {
                var easy = await GetQuestions(checkBlue.SubjectId, ch.Chapter, (int)QuestionDifficulty.Easy, ch.EasyCount);
                var medium = await GetQuestions(checkBlue.SubjectId, ch.Chapter, (int)QuestionDifficulty.Medium, ch.MediumCount);
                var hard = await GetQuestions(checkBlue.SubjectId, ch.Chapter, (int)QuestionDifficulty.Hard, ch.HardCount);
                var veryhard = await GetQuestions(checkBlue.SubjectId, ch.Chapter, (int)QuestionDifficulty.VeryHard, ch.VeryHardCount);

                BuildQuestionExam(questionExams, exam, easy);
                BuildQuestionExam(questionExams, exam, medium);
                BuildQuestionExam(questionExams, exam, hard);
                BuildQuestionExam(questionExams, exam, veryhard);

            }

            await _questionExamRepo.AddRangeAsync(questionExams);
            await _questionExamRepo.SaveChangesAsync();

            return exam;

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
                .OrderBy(q => Guid.NewGuid())
                .Take(count)
                .ToList();
        }

        private void BuildQuestionExam(List<QuestionExam> list, Exam exam, List<Question> questions)
        {
            foreach (var q in questions)
            {
                list.Add(new QuestionExam
                {
                    ExamId = exam.Id,
                    QuestionId = q.Id,
                    CorrectAnswer = GetCorrectAnswer(q.Answer) // Lấy correct từ chuỗi
                });
            }
        }

        private string GetCorrectAnswer(string list)
        {
            return "";
        }
    }
}
