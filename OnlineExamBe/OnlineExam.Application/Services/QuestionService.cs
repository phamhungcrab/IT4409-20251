using OnlineExam.Application.Dtos.Question;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class QuestionService : CrudService<Question>, IQuestionService
    {
        public QuestionService(IRepository<Question> repo)
        : base(repo)
        {
        }

        public async Task<bool> AddListQuestion(CreateQuestionDto[] questionDtos)
        {
            var entities = questionDtos.Select(dto => new Question
            {
                Content = dto.Content,
                Answer = dto.Answer,
                Point = dto.Point,
                Difficulty = dto.Difficulty,
                Type = dto.Type,
                SubjectId = dto.SubjectId,
                Chapter = dto.Chapter
            }).ToList();

            await _repository.AddRangeAsync(entities);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
