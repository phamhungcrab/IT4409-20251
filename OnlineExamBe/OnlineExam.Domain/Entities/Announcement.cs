using System;
using System.Collections.Generic;

namespace OnlineExam.Domain.Entities
{
    /// <summary>
    /// Thông báo từ Teacher gửi đến sinh viên trong lớp học.
    /// </summary>
    public class Announcement
    {
        public int Id { get; set; }

        /// <summary>
        /// Tiêu đề thông báo.
        /// </summary>
        public required string Title { get; set; }

        /// <summary>
        /// Nội dung chi tiết thông báo.
        /// </summary>
        public required string Content { get; set; }

        /// <summary>
        /// Loại thông báo: info, warning, success, error.
        /// </summary>
        public string Type { get; set; } = "info";

        /// <summary>
        /// Lớp nhận thông báo (FK → Class).
        /// </summary>
        public int ClassId { get; set; }

        /// <summary>
        /// Teacher tạo thông báo (FK → User).
        /// </summary>
        public int CreatedBy { get; set; }

        /// <summary>
        /// Thời gian tạo thông báo.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Class? Class { get; set; }
        public User? Creator { get; set; }
        public ICollection<StudentAnnouncement> StudentAnnouncements { get; set; } = new List<StudentAnnouncement>();
    }
}
