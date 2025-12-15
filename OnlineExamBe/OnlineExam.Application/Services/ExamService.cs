using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineExam.Application.Dtos.Exam;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Application.Services.Helpers;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;

namespace OnlineExam.Application.Services
{
    public class ExamService : CrudService<Exam>, IExamService
    {
        private readonly IRepository<Question> _questionRepo;
        private readonly IRepository<ExamBlueprint> _blueprintRepo;
        private readonly IRepository<QuestionExam> _questionExamRepo;
        private readonly IRepository<ExamStudent> _examStudentRepo;
        private readonly IRepository<StudentClass> _studentClassRepo;

        public ExamService(
            IRepository<Exam> examRepo,
            IRepository<Question> questionRepo,
            IRepository<ExamBlueprint> blueprintRepo,
            IRepository<QuestionExam> questionExamRepo,
            IRepository<ExamStudent> examStudentRepo,
            IRepository<StudentClass> studentClassRepo) : base(examRepo)
        {
            _questionRepo = questionRepo;
            _blueprintRepo = blueprintRepo;
            _questionExamRepo = questionExamRepo;
            _examStudentRepo = examStudentRepo;
            _studentClassRepo = studentClassRepo;
        }

        public async Task<IEnumerable<Exam>> GetExamsByStudentId(int studentId)
        {
            var classIds = await _studentClassRepo.Query()
                .Where(sc => sc.StudentId == studentId)
                .Select(sc => sc.ClassId)
                .ToListAsync();

            if (!classIds.Any()) return new List<Exam>();

            return await _repository.Query()
                .Where(e => classIds.Contains(e.ClassId))
                .ToListAsync();
        }

        public async Task<ExamStudent?> GetExamStudent(int examId, int studentId)
        {
            return await _examStudentRepo
                .Query()
                .FirstOrDefaultAsync(x => x.StudentId == studentId && x.ExamId == examId);
        }

        public async Task<ExamGenerateResultDto> GenerateExamAsync(CreateExamForStudentDto dto)
        {
            var exam = await base.GetByIdAsync(dto.ExamId);
            if (exam == null) throw new Exception("Exam not found");

            var blueprint = await _blueprintRepo
                .Query()
                .Include(x => x.Chapters)
                .FirstOrDefaultAsync(x => x.Id == exam.BlueprintId);

            if (blueprint == null)
                throw new Exception("Blueprint not found!");

            if (blueprint.Chapters.IsNullOrEmpty())
                throw new Exception("Chapters not found!");

            var chapters = blueprint.Chapters!.ToList();
            var expectedTotal = chapters.Sum(c => c.EasyCount + c.MediumCount + c.HardCount + c.VeryHardCount);

            // Reuse generated questions when resuming
            var existingQuestionExams = await _questionExamRepo.Query()
                .Include(qe => qe.Question)
                .Where(qe => qe.ExamId == dto.ExamId && qe.StudentId == dto.StudentId)
                .ToListAsync();

            if (existingQuestionExams.Any())
            {
                // If existing count mismatches blueprint, regenerate
                if (existingQuestionExams.Count != expectedTotal)
                {
                    foreach (var qe in existingQuestionExams)
                    {
                        _questionExamRepo.DeleteAsync(qe);
                    }
                    await _questionExamRepo.SaveChangesAsync();
                    existingQuestionExams.Clear();
                }
                else
                {
                    // Randomize order for FE display to avoid static ordering
                    existingQuestionExams = existingQuestionExams
                        .OrderBy(_ => Guid.NewGuid())
                        .ToList();

                    bool needsUpdate = false;
                    foreach (var qe in existingQuestionExams)
                    {
                        var q = qe.Question ?? new Question { Content = string.Empty, Answer = string.Empty };
                        var normalized = AnswerParser.NormalizeAnswerFlexible(q.Answer ?? string.Empty);

                        // If old data missing or different, refresh to normalized text answer
                        if (string.IsNullOrWhiteSpace(qe.CorrectAnswer) ||
                            !qe.CorrectAnswer.Equals(normalized, StringComparison.OrdinalIgnoreCase))
                        {
                            qe.CorrectAnswer = normalized;
                            needsUpdate = true;
                        }
                    }

                    if (needsUpdate)
                    {
                        await _questionExamRepo.SaveChangesAsync();
                    }

                    int existingOrder = 1;
                    return new ExamGenerateResultDto
                    {
                        ExamId = exam.Id,
                        Name = exam.Name,
                        TotalQuestions = existingQuestionExams.Count,
                        ClassId = exam.ClassId,
                        StartTime = exam.StartTime,
                        EndTime = exam.EndTime,
                        DurationMinutes = exam.DurationMinutes,
                        BlueprintId = exam.BlueprintId,
                        Questions = existingQuestionExams.Select(qe =>
                        {
                            var q = qe.Question ?? new Question { Content = string.Empty, Answer = string.Empty };
                            var parsed = AnswerParser.ParseOptions(q.Answer ?? string.Empty);
                            return new GeneratedQuestionDto
                            {
                                Id = q.Id,
                                Type = q.Type,
                                Difficulty = q.Difficulty,
                                Order = existingOrder++,
                                Content = q.Content ?? string.Empty,
                                ImageUrl = q.ImageUrl,
                                Point = q.Point,
                                Chapter = q.Chapter,
                                CleanAnswer = parsed.CleanOptions,
                                CorrectOptionIds = parsed.CorrectOptionIds
                            };
                        }).ToList()
                    };
                }
            }

            var questionExams = new List<QuestionExam>();
            var allQuestions = new List<Question>();
            var chosenIds = new HashSet<int>();

            foreach (var ch in chapters)
            {
                var easy = await GetQuestions(blueprint.SubjectId, ch.Chapter, (int)QuestionDifficulty.Easy, ch.EasyCount);
                var medium = await GetQuestions(blueprint.SubjectId, ch.Chapter, (int)QuestionDifficulty.Medium, ch.MediumCount);
                var hard = await GetQuestions(blueprint.SubjectId, ch.Chapter, (int)QuestionDifficulty.Hard, ch.HardCount);
                var veryHard = await GetQuestions(blueprint.SubjectId, ch.Chapter, (int)QuestionDifficulty.VeryHard, ch.VeryHardCount);

                void AddUnique(IEnumerable<Question> qs)
                {
                    foreach (var q in qs)
                    {
                        if (chosenIds.Add(q.Id))
                        {
                            allQuestions.Add(q);
                        }
                    }
                }

                AddUnique(easy);
                AddUnique(medium);
                AddUnique(hard);
                AddUnique(veryHard);
            }

            // Fallback: nếu thiếu câu, lấy thêm câu bất kỳ của môn (khác chapter/difficulty) để đủ expectedTotal
            if (allQuestions.Count < expectedTotal)
            {
                var additionalNeeded = expectedTotal - allQuestions.Count;
                var more = await _questionRepo
                    .Query()
                    .Where(q => q.SubjectId == blueprint.SubjectId && !chosenIds.Contains(q.Id))
                    .OrderBy(q => Guid.NewGuid())
                    .Take(additionalNeeded)
                    .ToListAsync();

                foreach (var q in more)
                {
                    if (chosenIds.Add(q.Id))
                    {
                        allQuestions.Add(q);
                    }
                }
            }

            // Trường hợp vẫn thiếu (không đủ câu trong ngân hàng), dùng lại câu khác để lấp đủ số lượng
            if (allQuestions.Count < expectedTotal && allQuestions.Count > 0)
            {
                var rnd = new Random();
                while (allQuestions.Count < expectedTotal)
                {
                    var pick = allQuestions[rnd.Next(allQuestions.Count)];
                    allQuestions.Add(pick);
                }
            }

            allQuestions = allQuestions
                .Take(expectedTotal) // bảo đảm đúng số lượng yêu cầu
                .OrderBy(x => Guid.NewGuid())
                .ToList();

            BuildQuestionExam(questionExams, exam, allQuestions, dto.StudentId);

            try
            {
                await _questionExamRepo.AddRangeAsync(questionExams);
                await _questionExamRepo.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx)
            {
                // Likely duplicate QuestionExam (ExamId, StudentId, QuestionId) from a previous attempt.
                Console.WriteLine($"[GenerateExamAsync] Duplicate QuestionExam, reusing existing. Detail: {dbEx}");

                var existing = await _questionExamRepo.Query()
                    .Include(qe => qe.Question)
                    .Where(qe => qe.ExamId == dto.ExamId && qe.StudentId == dto.StudentId)
                    .ToListAsync();

                if (existing.Any())
                {
                    allQuestions = existing.Select(x => x.Question ?? new Question { Content = string.Empty, Answer = string.Empty }).ToList();
                }
                else
                {
                    throw;
                }
            }

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
                Questions = allQuestions.Select(q =>
                {
                    var parsed = AnswerParser.ParseOptions(q.Answer ?? string.Empty);
                    return new GeneratedQuestionDto
                    {
                        Id = q.Id,
                        Type = q.Type,
                        Difficulty = q.Difficulty,
                        Order = order++,
                        Content = q.Content,
                        ImageUrl = q.ImageUrl,
                        Point = q.Point,
                        Chapter = q.Chapter,
                        CleanAnswer = parsed.CleanOptions,
                        CorrectOptionIds = parsed.CorrectOptionIds
                    };
                }).ToList()
            };

            if (questionExams.Count < expectedTotal)
            {
                Console.WriteLine($"[GenerateExam] Not enough questions available for exam {exam.Id}. Expected {expectedTotal}, got {questionExams.Count}. BlueprintId={blueprint.Id}");
            }

            return result;
        }

        private async Task<List<Question>> GetQuestions(
            int subjectId,
            int chapter,
            int difficulty,
            int count)
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

        private void BuildQuestionExam(List<QuestionExam> list, Exam exam, List<Question> questions, int studentId)
        {
            foreach (var q in questions)
            {
                list.Add(new QuestionExam
                {
                    ExamId = exam.Id,
                    QuestionId = q.Id,
                    StudentId = studentId,
                    CorrectAnswer = AnswerParser.NormalizeAnswerFlexible(q.Answer ?? string.Empty),
                    Point = q.Point
                });
            }
        }
    }
}
