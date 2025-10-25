using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers
{
    /// <summary>
    /// Provides CRUD operations for managing questions in the question
    /// bank.  Only teachers and administrators may create, update or
    /// delete questions.  Students should never have access to this
    /// controller.  Each question may have multiple options for
    /// SINGLE_CHOICE or MULTI_CHOICE types or free form text for
    /// essay questions.  The service layer should handle validation
    /// of correct answers and ensure that modifications do not
    /// retroactively affect published exams.  This controller is a
    /// stub demonstrating route definitions.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuestionsController : ControllerBase
    {
        // private readonly IQuestionService _questionService;
        // public QuestionsController(IQuestionService questionService)
        // {
        //     _questionService = questionService;
        // }

        /// <summary>
        /// Get a list of all questions.  Administrators and teachers
        /// may view the complete question bank.  Filtering by
        /// subject or search query should be handled by the service.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> GetAllQuestions()
        {
            await Task.CompletedTask;
            return Ok(new List<object>()); // Replace with actual question list
        }

        /// <summary>
        /// Get details for a single question by its ID.
        /// </summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> GetQuestionById(int id)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"GetQuestion {id} endpoint not yet implemented." });
        }

        /// <summary>
        /// Create a new question.  The request body should include
        /// the question text, type (single/multi choice/essay), a list
        /// of options (if applicable) and the correct answer(s).  Only
        /// teachers and administrators may call this endpoint.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> CreateQuestion([FromBody] object request)
        {
            await Task.CompletedTask;
            return Ok(new { message = "CreateQuestion endpoint not yet implemented." });
        }

        /// <summary>
        /// Update an existing question.  For published exams, the
        /// service layer should create a new version or snapshot of
        /// the question rather than directly modifying the existing
        /// one.  Only teachers and administrators can update questions.
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] object request)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"UpdateQuestion {id} endpoint not yet implemented." });
        }

        /// <summary>
        /// Delete a question.  Use soft delete or disable the question
        /// to preserve history if the question has been used in an
        /// exam.  Only teachers and administrators can delete.
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"DeleteQuestion {id} endpoint not yet implemented." });
        }
    }
}