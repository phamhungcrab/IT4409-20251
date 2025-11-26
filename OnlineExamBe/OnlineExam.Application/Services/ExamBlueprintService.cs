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
        public ExamBlueprintService(
            IRepository<ExamBlueprint> blueprintRepo,
            IRepository<ExamBlueprintChapter> chapterRepo
        ) : base(blueprintRepo)
        {
            _chapterRepo = chapterRepo;
        }

        public async Task<ExamBlueprintDto> CreateBlueprintAsync(CreateExamBlueprintDto dto)
        {
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
    }
}
