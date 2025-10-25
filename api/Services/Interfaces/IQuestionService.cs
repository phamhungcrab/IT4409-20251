using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Models.DTOs.Question;

namespace Api.Services.Interfaces
{
    /// <summary>
    /// Defines operations for managing the question bank.  Supports
    /// CRUD operations and retrieval with optional filters.  The
    /// service should enforce business rules such as immutability of
    /// questions used in published exams and correct option counts.
    /// </summary>
    public interface IQuestionService
    {
        /// <summary>
        /// Create a new question in the bank.  The authorId
        /// identifies the teacher or admin performing the operation.
        /// </summary>
        Task<QuestionResponse> CreateQuestionAsync(CreateQuestionRequest request, int authorId);

        /// <summary>
        /// Retrieve a question by its identifier.  Teachers and admins
        /// may view any question; students should not call this method.
        /// </summary>
        Task<QuestionResponse> GetQuestionByIdAsync(int id);

        /// <summary>
        /// Retrieve a collection of questions.  Optional filters may
        /// include subjectId, search term or pagination parameters.
        /// </summary>
        Task<IReadOnlyList<QuestionResponse>> GetQuestionsAsync(int? subjectId = null, string? search = null);

        /// <summary>
        /// Update an existing question.  If the question has been
        /// included in published exams, a new version should be
        /// created instead of modifying the original to preserve
        /// history.
        /// </summary>
        Task<QuestionResponse> UpdateQuestionAsync(int id, CreateQuestionRequest request);

        /// <summary>
        /// Delete a question from the bank.  Implementations should
        /// perform a soft delete if the question has been used in
        /// exams or referenced elsewhere.
        /// </summary>
        Task DeleteQuestionAsync(int id);
    }
}