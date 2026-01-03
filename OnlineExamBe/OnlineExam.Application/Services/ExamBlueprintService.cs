using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.ExamBlueprint;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    
    public class ExamBlueprintService :  CrudService<ExamBlueprint> , IExamBlueprintService
    {
        public readonly IRepository<ExamBlueprintChapter> _chapterRepo;
        public readonly IRepository<Exam> _examRepo;
        public readonly IRepository<Question> _questionRepo;
        public ExamBlueprintService(
            IRepository<ExamBlueprint> blueprintRepo,
            IRepository<Exam> examRepo,
            IRepository<Question> questionRepo,
            IRepository<ExamBlueprintChapter> chapterRepo
        ) : base(blueprintRepo)
        {
            _chapterRepo = chapterRepo;
            _examRepo = examRepo;
            _questionRepo = questionRepo;
        }

        public async Task<ExamBlueprintDto> CreateBlueprintAsync(CreateExamBlueprintDto dto)
        {
            //Kiem tra xem db có ít nhất 1 câu hỏi cho câu hỏi với độ khó chương đó không
            await ValidateBlueprintAsync(dto);

            var blueprint = new ExamBlueprint
            {
                SubjectId = dto.SubjectId,
                CreatedAt = DateTime.Now
            };            

            await base.CreateAsync(blueprint);

            var chapters = dto.Chapters.Select(c => new ExamBlueprintChapter
            {
                BlueprintId = blueprint.Id,
                Chapter = c.Chapter,
                EasyCount = c.EasyCount,
                MediumCount = c.MediumCount,
                HardCount = c.HardCount,
                VeryHardCount = c.VeryHardCount
            }).ToList();

            await _chapterRepo.AddRangeAsync(chapters);
            await _chapterRepo.SaveChangesAsync();

            var result = new ExamBlueprintDto
            {
                Id = blueprint.Id,
                SubjectId = blueprint.SubjectId,
                CreatedAt = blueprint.CreatedAt,
                TotalQuestions = chapters.Sum(c => c.TotalQuestions),
                Chapters = chapters.Select(c => new ExamBlueprintChapterDto
                {
                    Chapter = c.Chapter,
                    EasyCount = c.EasyCount,
                    MediumCount = c.MediumCount,
                    HardCount = c.HardCount,
                    VeryHardCount = c.VeryHardCount
                }).ToList()
            };

            return result;
        }

        public async Task<ExamBlueprintDto> GetDetailAsync(int blueprintId)
        {
            var blueprint = await _repository
                .Query()
                .Include(b => b.Chapters)
                .FirstOrDefaultAsync(b => b.Id == blueprintId);

            if (blueprint == null)
                throw new Exception("Không tìm thấy blueprint");

            return MapToDto(blueprint, blueprint.Chapters!.ToList());
        }

        public async Task<ExamBlueprintDto> UpdateBlueprintAsync(
            int blueprintId,
            CreateExamBlueprintDto dto)
        {
            //Kiem tra xem db có ít nhất 1 câu hỏi cho câu hỏi với độ khó chương đó không
            await ValidateBlueprintAsync(dto);

            var blueprint = await _repository
                .Query()
                .Include(b => b.Chapters)
                .FirstOrDefaultAsync(b => b.Id == blueprintId);

            if (blueprint == null)
                throw new Exception("Không tìm thấy blueprint");

            await _chapterRepo
                .Query()
                .Where(c => c.BlueprintId == blueprintId)
                .ExecuteDeleteAsync();

            var chapters = dto.Chapters.Select(c => new ExamBlueprintChapter
            {
                BlueprintId = blueprintId,
                Chapter = c.Chapter,
                EasyCount = c.EasyCount,
                MediumCount = c.MediumCount,
                HardCount = c.HardCount,
                VeryHardCount = c.VeryHardCount
            }).ToList();

            await _chapterRepo.AddRangeAsync(chapters);
            await _chapterRepo.SaveChangesAsync();

            blueprint.SubjectId = dto.SubjectId;
            _repository.UpdateAsync(blueprint);
            await _repository.SaveChangesAsync();

            return MapToDto(blueprint, chapters);
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            var blueprint = await _repository.GetByIdAsync(id);
            if (blueprint == null)
                throw new Exception("Blueprint không tồn tại");

            var used = await _examRepo
                .Query()
                .AnyAsync(e => e.BlueprintId == id);

            if (used)
                throw new Exception(
                    "Blueprint đã được sử dụng cho kỳ thi, không thể xóa"
                );

            _repository.DeleteAsync(blueprint);
            await _repository.SaveChangesAsync();
            return true;
        }

        private static ExamBlueprintDto MapToDto(
            ExamBlueprint blueprint,
            List<ExamBlueprintChapter> chapters)
        {
            return new ExamBlueprintDto
            {
                Id = blueprint.Id,
                SubjectId = blueprint.SubjectId,
                CreatedAt = blueprint.CreatedAt,
                TotalQuestions = chapters.Sum(c => c.TotalQuestions),
                Chapters = chapters.Select(c => new ExamBlueprintChapterDto
                {
                    Chapter = c.Chapter,
                    EasyCount = c.EasyCount,
                    MediumCount = c.MediumCount,
                    HardCount = c.HardCount,
                    VeryHardCount = c.VeryHardCount
                }).ToList()
            };
        }

        private async Task ValidateBlueprintAsync(CreateExamBlueprintDto dto)
        {
            if (dto.Chapters == null || !dto.Chapters.Any())
                throw new Exception("Blueprint phải có ít nhất 1 chapter");

            foreach (var ch in dto.Chapters)
            {
                await EnsureQuestionExists(dto.SubjectId, ch.Chapter, QuestionDifficulty.Easy, ch.EasyCount);
                await EnsureQuestionExists(dto.SubjectId, ch.Chapter, QuestionDifficulty.Medium, ch.MediumCount);
                await EnsureQuestionExists(dto.SubjectId, ch.Chapter, QuestionDifficulty.Hard, ch.HardCount);
                await EnsureQuestionExists(dto.SubjectId, ch.Chapter, QuestionDifficulty.VeryHard, ch.VeryHardCount);
            }
        }

        private async Task EnsureQuestionExists(
            int subjectId,
            int chapter,
            QuestionDifficulty difficulty,
            int requiredCount)
        {
            if (requiredCount <= 0) return;

            var exists = await _questionRepo
                .Query()
                .AnyAsync(q =>
                    q.SubjectId == subjectId &&
                    q.Chapter == chapter &&
                    q.Difficulty == difficulty);

            if (!exists)
                throw new Exception(
                    $"Không có câu hỏi cho Subject={subjectId}, Chapter={chapter}, Difficulty={difficulty}"
                );
        }
    }
}
