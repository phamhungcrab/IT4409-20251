using System;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents an announcement posted to students.  Announcements
    /// may be tied to a specific exam, a class or global.  They
    /// include a message and optional severity.  Announcements are
    /// created by teachers or admins and recorded for audit
    /// purposes.  Real-time delivery is handled via the hubs.
    /// </summary>
    public class Announcement
    {
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the exam if the announcement is exam specific.
        /// Null if it is a class or global announcement.
        /// </summary>
        public int? ExamId { get; set; }

        /// <summary>
        /// Foreign key to the class if the announcement is class specific.
        /// Null if exam specific or global.
        /// </summary>
        public int? ClassId { get; set; }

        /// <summary>
        /// Foreign key to the user who posted the announcement.
        /// </summary>
        public int CreatedById { get; set; }

        /// <summary>
        /// Announcement message text.  May include Markdown or plain
        /// text; clients should sanitize as necessary.
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Optional severity (e.g., "info", "success", "warning",
        /// "error") used by the UI to style the banner.
        /// </summary>
        public string? Severity { get; set; }

        /// <summary>
        /// Timestamp when the announcement was created (UTC).
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Navigation to the exam.
        /// </summary>
        public virtual Exam? Exam { get; set; }

        /// <summary>
        /// Navigation to the class.
        /// </summary>
        public virtual Class? Class { get; set; }

        /// <summary>
        /// Navigation to the user who created the announcement.
        /// </summary>
        public virtual User CreatedBy { get; set; } = null!;
    }
}