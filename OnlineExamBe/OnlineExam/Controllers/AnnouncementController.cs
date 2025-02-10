using Microsoft.AspNetCore.Mvc;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAnnouncements()
        {
            // Mock data
            var announcements = new[]
            {
                new { id = 1, title = "Welcome to the Online Exam System", content = "Good luck with your exams!", date = DateTime.Now.AddDays(-1), type = "info" },
                new { id = 2, title = "Maintenance Scheduled", content = "System maintenance on Sunday 2 AM.", date = DateTime.Now.AddDays(2), type = "warning" }
            };
            return Ok(announcements);
        }
    }
}
