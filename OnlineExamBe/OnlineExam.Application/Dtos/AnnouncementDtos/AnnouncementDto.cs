using System;
using OnlineExam.Domain.Entities;

namespace OnlineExam.Application.Dtos.AnnouncementDtos
{
    /// <summary>
    /// DTO để trả về thông tin thông báo cho frontend.
    /// </summary>
    public class AnnouncementDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public DateTime CreatedAt { get; set; }
        public bool IsDismissed { get; set; }
        public bool IsRead { get; set; }
        public int ClassId { get; set; }
        public string? ClassName { get; set; }

        public AnnouncementDto() { }

        /// <summary>
        /// Constructor từ entity Announcement và StudentAnnouncement.
        /// </summary>
        public AnnouncementDto(Announcement announcement, StudentAnnouncement? studentAnnouncement = null)
        {
            Id = announcement.Id;
            Title = announcement.Title;
            Content = announcement.Content;
            Type = announcement.Type;
            CreatedAt = announcement.CreatedAt;
            ClassId = announcement.ClassId;
            ClassName = announcement.Class?.Name;
            IsDismissed = studentAnnouncement?.IsDismissed ?? false;
            IsRead = studentAnnouncement?.IsRead ?? false;
        }
    }
}
