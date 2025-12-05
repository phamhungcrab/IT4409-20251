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
using System.Globalization;
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
        private readonly IRepository<ExamStudent> _examStudentRepo;
        private readonly IRepository<StudentClass> _studentClassRepo;
        private readonly IRepository<Exam> _examRepo;

        public ExamService(
            IRepository<Exam> examRepo,
            IRepository<Question> questionRepo,
            IRepository<ExamBlueprint> blueprintRepo,
            IRepository<QuestionExam> questionExamRepo,
            IRepository<ExamStudent> examStudentRepo,
            IRepository<StudentClass> studentClassRepo

            ) : base(examRepo)
        {
            _examRepo = examRepo;
            _questionRepo = questionRepo;
            _blueprintRepo = blueprintRepo;
            _questionExamRepo = questionExamRepo;
            _examStudentRepo = examStudentRepo;
            _studentClassRepo = studentClassRepo;
        }

        public async Task<List<Exam>> GetExamsByStudentAsync(int studentId)
        {
            var classIds = await _studentClassRepo.Query()
                .Where(sc => sc.StudentId == studentId)
                .Select(sc => sc.ClassId)
                .ToListAsync();

            var exams = await _examRepo.Query()
                .Where(e => classIds.Contains(e.ClassId))
                .ToListAsync();

            return exams;
        }

        public async Task<ExamStudent?> GetExamStudent(int examId, int studentId)
        {
            var exis = await _examStudentRepo
                .Query()
                .FirstOrDefaultAsync(x => x.StudentId == studentId && x.ExamId == examId);
            return exis;
        }

        public async Task<ExamGenerateResultDto> GenerateExamAsync(CreateExamForStudentDto dto)
        {
            var exam = await base.GetByIdAsync(dto.ExamId);

            if (exam == null) throw new Exception("Không tồn tại bài thi này");

            var checkBlue = await _blueprintRepo
                .Query()
                .Include(x => x.Chapters)
                .FirstOrDefaultAsync(x => x.Id == exam.BlueprintId);

            if (checkBlue == null)
                throw new Exception("Blueprint not found!");

            if (checkBlue.Chapters.IsNullOrEmpty()) throw new Exception("Chapters not found!");

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
                .OrderBy(q => Guid.NewGuid())
                .Take(count)
                .ToList();
        }

        private void BuildQuestionExam(List<QuestionExam> list, Exam? exam, List<Question> questions, int StudentId)
        {
            if (exam == null) throw new Exception("Không tìm thấy bài thi from build");
            foreach (var q in questions)
            {
                list.Add(new QuestionExam
                {
                    ExamId = exam.Id,
                    QuestionId = q.Id,
                    StudentId = StudentId,
                    CorrectAnswer = GetCorrectAnswer(q.Answer), // Lấy correct từ chuỗi
                    Point = q.Point
                });
            }
        }

        private string GetCorrectAnswer(string list)
        {
            if (string.IsNullOrWhiteSpace(list))
                return "";

            var correctAnswers = list
                            .Split('|', StringSplitOptions.RemoveEmptyEntries)
                            .Select(p => p.Trim())
                            .Where(p => p.EndsWith("*"))
                            .Select(p => p.TrimEnd('*').Trim())
                            .Where(p => p.Length > 0)
                            .Select(p => p.ToLowerInvariant()) // chuẩn hoá lowercase
                            .Distinct(StringComparer.InvariantCultureIgnoreCase)
                            .OrderBy(p => p, StringComparer.InvariantCultureIgnoreCase)
                            .ToList();

            return string.Join("|", correctAnswers);
        }

        private List<string> CleanAnswer(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return new List<string>();

            return raw.Split('|', StringSplitOptions.RemoveEmptyEntries)
                      .Select(x => x.Trim().TrimEnd('*').Trim())
                      .ToList();
        }
    }
}
