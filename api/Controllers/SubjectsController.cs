using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers
{
    /// <summary>
    /// Manages subject entities (courses).  A subject defines a broad
    /// category of knowledge such as Mathematics or English.  Only
    /// administrators and teachers should be allowed to create, update
    /// or delete subjects.  Students may read the list of subjects to
    /// browse available courses.  The concrete business logic should
    /// reside in an injected ISubjectService which encapsulates
    /// validation and persistence.  All methods here return stubs
    /// because this repository focuses on the database and system
    /// design rather than implementation.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubjectsController : ControllerBase
    {
        // private readonly ISubjectService _subjectService;
        // public SubjectsController(ISubjectService subjectService)
        // {
        //     _subjectService = subjectService;
        // }

        /// <summary>
        /// Return a list of all subjects in the system.  This endpoint
        /// can be accessed by any authenticated user.  In a real
        /// implementation the returned objects should be DTOs.
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllSubjects()
        {
            await Task.CompletedTask;
            return Ok(new List<object>()); // Replace with actual subject list
        }

        /// <summary>
        /// Return details of a single subject by its identifier.
        /// </summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSubjectById(int id)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"GetSubject {id} endpoint not yet implemented." });
        }

        /// <summary>
        /// Create a new subject.  Only administrators and teachers
        /// should be able to perform this operation.  The request body
        /// should contain the subject name and optional code.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> CreateSubject([FromBody] object request)
        {
            await Task.CompletedTask;
            return Ok(new { message = "CreateSubject endpoint not yet implemented." });
        }

        /// <summary>
        /// Update an existing subject.  The subjectId path parameter
        /// identifies which subject to update.  Only administrators and
        /// teachers should be allowed to update subjects.
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> UpdateSubject(int id, [FromBody] object request)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"UpdateSubject {id} endpoint not yet implemented." });
        }

        /// <summary>
        /// Delete a subject.  Use a soft delete strategy to allow
        /// historical exams to remain associated with the subject.  Only
        /// administrators should be permitted to delete subjects.
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"DeleteSubject {id} endpoint not yet implemented." });
        }
    }
}