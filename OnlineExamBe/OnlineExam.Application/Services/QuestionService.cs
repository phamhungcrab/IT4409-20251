using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.Question;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.UserDtos;
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
    public class QuestionService : CrudService<Question>, IQuestionService
    {
        public QuestionService(IRepository<Question> repo)
        : base(repo)
        {
        }
        public async Task<ResultApiModel> SearchForAdminAsync(SearchQuestionDto searchModel)
        {
            var query = _repository.Query();
            if (!string.IsNullOrEmpty(searchModel.Content))
            {
                var content = searchModel.Content.ToLower().Trim();
                query = query.Where(c => c.Content.ToLower().Trim().Contains(content));
            }

            if (searchModel.PointFrom != null)
            {
                query = query.Where(c => c.Point >= searchModel.PointFrom);
            }

            if (searchModel.PointTo != null)
            {
                query = query.Where(c => c.Point <= searchModel.PointTo);
            }

            if (searchModel.DifficultyFrom != null)
            {
                query = query.Where(c => c.Difficulty >= searchModel.DifficultyFrom);
            }

            if (searchModel.DifficultyTo != null)
            {
                query = query.Where(c => c.Difficulty <= searchModel.DifficultyTo);
            }

            if (searchModel.Type != null)
            {
                query = query.Where(c => c.Type == searchModel.Type);
            }

            if (searchModel.SubjectId != null)
            {
                query = query.Where(c => c.SubjectId == searchModel.SubjectId);
            }

            if (searchModel.Chapter != null)
            {
                query = query.Where(c => c.Chapter == searchModel.Chapter);
            }
            var totalItems = await query.CountAsync();

            var users = await query
                .Skip((searchModel.PageNumber - 1) * searchModel.PageSize)
                .Take(searchModel.PageSize)
                .Select(c => new QuestionDto
                {
                    Id = c.Id,
                    Answer = c.Answer,
                    Content = c.Content,
                    Point = c.Point,
                    Difficulty = c.Difficulty,
                    Type = c.Type,
                    Chapter = c.Chapter,
                    SubjectId = c.SubjectId
                })
                .ToListAsync();

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new
                {
                    TotalItems = totalItems,
                    Users = users
                }
            };

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
