using System;

namespace OnlineExam.Domain.Entities
{
    /// <summary>
    /// Join table: theo dõi trạng thái thông báo cho từng sinh viên.
    /// Composite key: (StudentId, AnnouncementId)
    /// </summary>
    public class StudentAnnouncement
    {
        /// <summary>
        /// Sinh viên nhận thông báo (FK → User).
        /// </summary>
        public int StudentId { get; set; }

        /// <summary>
        /// Thông báo (FK → Announcement).
        /// </summary>
        public int AnnouncementId { get; set; }

        /// <summary>
        /// Banner đã hiển thị 1 lần (không hiện lại nữa).
        /// Set = true khi banner biến mất sau progress bar.
        /// </summary>
        public bool IsDismissed { get; set; } = false;

        /// <summary>
        /// Sinh viên đã đọc thông báo (click trong dropdown chuông).
        /// </summary>
        public bool IsRead { get; set; } = false;

        /// <summary>
        /// Thời gian đọc thông báo.
        /// </summary>
        public DateTime? ReadAt { get; set; }

        // Navigation properties
        public User? Student { get; set; }
        public Announcement? Announcement { get; set; }
    }
}
