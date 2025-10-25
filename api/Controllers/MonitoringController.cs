using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers
{
    /// <summary>
    /// Provides endpoints for real-time monitoring of exams.  These
    /// endpoints are complementary to the SignalR hub used for
    /// live updates and can be used to fetch aggregated snapshots of
    /// exam progress, participant status and other metrics.  Only
    /// teachers and administrators should have access.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public class MonitoringController : ControllerBase
    {
        // private readonly IMonitoringService _monitoringService;
        // public MonitoringController(IMonitoringService monitoringService)
        // {
        //     _monitoringService = monitoringService;
        // }

        /// <summary>
        /// Get a list of participants in a given exam along with
        /// their current status (online/offline, progress, time left).
        /// This can be polled periodically in addition to SignalR
        /// updates.  The service layer should apply appropriate
        /// filtering and ordering.
        /// </summary>
        [HttpGet("exams/{examId:int}/participants")]
        public async Task<IActionResult> GetParticipants(int examId)
        {
            await Task.CompletedTask;
            return Ok(new List<object>()); // Replace with actual participant DTOs
        }

        /// <summary>
        /// Get an aggregated progress summary for an exam.  This may
        /// include counts of completed, in progress and expired exam
        /// sessions, average time remaining and other statistics.
        /// </summary>
        [HttpGet("exams/{examId:int}/summary")]
        public async Task<IActionResult> GetExamSummary(int examId)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"GetExamSummary {examId} endpoint not yet implemented." });
        }
    }
}