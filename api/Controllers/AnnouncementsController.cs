using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers
{
    /// <summary>
    /// Manages announcements that can be broadcast to students in
    /// particular exams or classes.  Teachers and administrators can
    /// create announcements; students can view them.  Announcements
    /// sent to an exam should also be pushed over SignalR for
    /// immediate visibility.  The service layer ensures only
    /// authorized users can post announcements and persists them
    /// for future retrieval.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnnouncementsController : ControllerBase
    {
        // private readonly IAnnouncementService _announcementService;
        // public AnnouncementsController(IAnnouncementService announcementService)
        // {
        //     _announcementService = announcementService;
        // }

        /// <summary>
        /// Get all announcements for a particular exam.  Students
        /// enrolled in the exam may access this endpoint.  Teachers
        /// and admins may see all announcements they have posted.
        /// </summary>
        [HttpGet("exams/{examId:int}")]
        public async Task<IActionResult> GetExamAnnouncements(int examId)
        {
            await Task.CompletedTask;
            return Ok(new List<object>()); // Replace with actual announcement list
        }

        /// <summary>
        /// Post a new announcement to an exam.  The body should
        /// contain the announcement text and optional severity or
        /// category.  The service layer should broadcast the
        /// announcement over SignalR.  Only teachers and admins may
        /// post announcements.
        /// </summary>
        [HttpPost("exams/{examId:int}")]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> CreateExamAnnouncement(int examId, [FromBody] object request)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"CreateExamAnnouncement {examId} endpoint not yet implemented." });
        }

        /// <summary>
        /// Get global announcements not tied to a specific exam.
        /// These may include maintenance windows or system-wide
        /// messages.  Any authenticated user can view these.
        /// </summary>
        [HttpGet("global")]
        [AllowAnonymous]
        public async Task<IActionResult> GetGlobalAnnouncements()
        {
            await Task.CompletedTask;
            return Ok(new List<object>()); // Replace with actual global announcements
        }

        /// <summary>
        /// Post a new global announcement.  Only administrators
        /// should post system-wide messages.
        /// </summary>
        [HttpPost("global")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateGlobalAnnouncement([FromBody] object request)
        {
            await Task.CompletedTask;
            return Ok(new { message = "CreateGlobalAnnouncement endpoint not yet implemented." });
        }
    }
}