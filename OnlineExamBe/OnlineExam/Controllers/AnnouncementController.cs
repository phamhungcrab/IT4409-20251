using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.AnnouncementDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Attributes;
using OnlineExam.Domain.Enums;

namespace OnlineExam.Controllers
{
    /// <summary>
    /// Controller quản lý thông báo.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementController : Controller
    {
        private readonly IAnnouncementService _announcementService;
        public AnnouncementController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        /// <summary>
        /// Teacher tạo thông báo cho sinh viên trong lớp.
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncementDto dto)
        {
            // Lấy teacherId từ session/claims
            var teacherIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (teacherIdClaim == null || !int.TryParse(teacherIdClaim.Value, out var teacherId))
            {
                return Unauthorized("Không xác định được người dùng");
            }
            
            var result = await _announcementService.CreateAsync(dto, teacherId);
            if(result.MessageCode == ResponseCode.Forbidden)
            {
                return Unauthorized("Forbidden: You do not have permission to perform this action.");
            }
            return Ok(result);
        }

        /// <summary>
        /// Student lấy danh sách thông báo của mình.
        /// </summary>
        [HttpGet("student")]
        public async Task<IActionResult> GetForStudent()
        {
            // Lấy studentId từ session/claims
            var studentIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (studentIdClaim == null || !int.TryParse(studentIdClaim.Value, out var studentId))
            {
                return Unauthorized("Không xác định được người dùng");
            }

            var result = await _announcementService.GetForStudentAsync(studentId);
            return Ok(result);
        }

        /// <summary>
        /// Đánh dấu banner đã hiển thị (không hiện lại nữa).
        /// Gọi khi banner biến mất sau progress bar.
        /// </summary>
        [HttpPut("dismiss/{id}")]
        public async Task<IActionResult> Dismiss(int id)
        {
            var studentIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (studentIdClaim == null || !int.TryParse(studentIdClaim.Value, out var studentId))
            {
                return Unauthorized("Không xác định được người dùng");
            }

            var result = await _announcementService.DismissAsync(id, studentId);
            if (result.MessageCode == ResponseCode.NotFound)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Đánh dấu đã đọc (khi click vào thông báo trong dropdown chuông).
        /// </summary>
        [HttpPut("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var studentIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (studentIdClaim == null || !int.TryParse(studentIdClaim.Value, out var studentId))
            {
                return Unauthorized("Không xác định được người dùng");
            }

            var result = await _announcementService.MarkAsReadAsync(id, studentId);
            if (result.MessageCode == ResponseCode.NotFound)
            {
                return NotFound(result);
            }
            return Ok(result);
        }
    }
}
