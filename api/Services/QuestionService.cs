using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models.DTOs.Question;
using Api.Models.Entities;
using Api.Models.Enumerations;
using Api.Services.Interfaces;
using Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    /// <summary>
    /// Provides operations for managing the question bank.  This
    /// implementation illustrates basic CRUD functionality but omits
    /// advanced features such as versioning and partial credit
    /// calculation.  Questions used in published exams should be
    /// treated as immutable; the service can enforce that rule by
    /// checking snapshot tables before allowing updates【329956817899352†L59-L84】.
    /// </summary>
    public class QuestionService : IQuestionService
    {
        private readonly ApplicationDbContext _dbContext;

        public QuestionService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <inheritdoc />
        public async Task<QuestionResponse> CreateQuestionAsync(CreateQuestionRequest request, int authorId)
        {
            var question = new Question
            {
                SubjectId = request.SubjectId,
                Text = request.Text,
                Type = Enum.Parse<QuestionType>(request.Type, ignoreCase: true),
                Explanation = request.Explanation,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            // Map options
            if (request.Options != null)
            {
                question.Options = request.Options.Select(o => new Option
                {
                    Text = o.Text,
                    IsCorrect = o.IsCorrect,
                    Order = o.Order
                }).ToList();
            }
            _dbContext.Questions.Add(question);
            await _dbContext.SaveChangesAsync();
            return new QuestionResponse
            {
                Id = question.Id,
                SubjectId = question.SubjectId,
                Text = question.Text,
                Type = question.Type.ToString(),
                Explanation = question.Explanation,
                Options = question.Options?.Select(opt => new QuestionResponse.OptionResponse
                {
                    Id = opt.Id,
                    Text = opt.Text,
                    Order = opt.Order,
                    // Do not return IsCorrect to students; only for teachers
                    IsCorrect = opt.IsCorrect
                }).ToList()
            };
        }

        /// <inheritdoc />
        public async Task<QuestionResponse> GetQuestionByIdAsync(int id)
        {
            var question = await _dbContext.Questions
                .Include(q => q.Options)
                .SingleOrDefaultAsync(q => q.Id == id);
            if (question == null)
            {
                throw new KeyNotFoundException($"Question {id} not found");
            }
            return new QuestionResponse
            {
                Id = question.Id,
                SubjectId = question.SubjectId,
                Text = question.Text,
                Type = question.Type.ToString(),
                Explanation = question.Explanation,
                Options = question.Options?.Select(opt => new QuestionResponse.OptionResponse
                {
                    Id = opt.Id,
                    Text = opt.Text,
                    Order = opt.Order,
                    IsCorrect = opt.IsCorrect
                }).ToList()
            };
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<QuestionResponse>> GetQuestionsAsync(int? subjectId = null, string? search = null)
        {
            IQueryable<Question> query = _dbContext.Questions.Include(q => q.Options);
            if (subjectId.HasValue)
            {
                query = query.Where(q => q.SubjectId == subjectId.Value);
            }
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(q => q.Text.Contains(search));
            }
            var questions = await query.ToListAsync();
            return questions.Select(q => new QuestionResponse
            {
                Id = q.Id,
                SubjectId = q.SubjectId,
                Text = q.Text,
                Type = q.Type.ToString(),
                Explanation = q.Explanation,
                Options = q.Options?.Select(opt => new QuestionResponse.OptionResponse
                {
                    Id = opt.Id,
                    Text = opt.Text,
                    Order = opt.Order,
                    IsCorrect = opt.IsCorrect
                }).ToList()
            }).ToList();
        }

        /// <inheritdoc />
        public async Task<QuestionResponse> UpdateQuestionAsync(int id, CreateQuestionRequest request)
        {
            var question = await _dbContext.Questions.Include(q => q.Options).SingleOrDefaultAsync(q => q.Id == id);
            if (question == null)
            {
                throw new KeyNotFoundException($"Question {id} not found");
            }
            // TODO: Check if the question has been published in an exam and deny update
            question.Text = request.Text;
            question.Type = Enum.Parse<QuestionType>(request.Type, ignoreCase: true);
            question.Explanation = request.Explanation;
            question.SubjectId = request.SubjectId;
            question.UpdatedAt = DateTime.UtcNow;
            // Update options: simplistic approach - remove existing and add new
            _dbContext.Options.RemoveRange(question.Options);
            if (request.Options != null)
            {
                question.Options = request.Options.Select(o => new Option
                {
                    Text = o.Text,
                    IsCorrect = o.IsCorrect,
                    Order = o.Order
                }).ToList();
            }
            await _dbContext.SaveChangesAsync();
            return await GetQuestionByIdAsync(id);
        }

        /// <inheritdoc />
        public async Task DeleteQuestionAsync(int id)
        {
            var question = await _dbContext.Questions.Include(q => q.Options).SingleOrDefaultAsync(q => q.Id == id);
            if (question == null)
            {
                throw new KeyNotFoundException($"Question {id} not found");
            }
            // TODO: Perform soft delete if question is used in exams
            _dbContext.Options.RemoveRange(question.Options);
            _dbContext.Questions.Remove(question);
            await _dbContext.SaveChangesAsync();
        }
    }
}