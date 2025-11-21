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


        public async Task<ExamGenerateResultDto> GenerateExamAsync(CreateExamDto dto)
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
                .OrderBy(q => Guid.NewGuid())
                .Take(count)
                .ToList();
        }

        private void BuildQuestionExam(List<QuestionExam> list, Exam exam, List<Question> questions, int StudentId)
        {
            foreach (var q in questions)
            {
                list.Add(new QuestionExam
                {
                    ExamId = exam.Id,
                    QuestionId = q.Id,
                    StudentId = StudentId,
                    CorrectAnswer = GetCorrectAnswer(q.Answer) // Lấy correct từ chuỗi
                });
            }
        }

        private string GetCorrectAnswer(string list)
        {
            return "";
        }

        private string CleanAnswer(string raw)
        {
            return "";
        }

    }
}
