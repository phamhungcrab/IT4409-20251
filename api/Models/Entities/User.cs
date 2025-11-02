using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // 👈 THÊM
// ...

namespace Api.Models.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public Role Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Exam> AuthoredExams { get; set; } = new List<Exam>();

        // 👇 XÁC NHẬN NAV NGƯỢC VỚI Class.Teacher
        [InverseProperty(nameof(Class.Teacher))]
        public virtual ICollection<Class> ClassesTeaching { get; set; } = new List<Class>();

        public virtual ICollection<ExamStudent> ExamStudents { get; set; } = new List<ExamStudent>();
        public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
        public virtual ICollection<AuditEvent> AuditEvents { get; set; } = new List<AuditEvent>();

        // 👇 CHO QUAN HỆ HỌC SINH HỌC LỚP (M-N), non-null + virtual
        [InverseProperty(nameof(Class.Students))]
        public virtual ICollection<Class> EnrolledClasses { get; set; } = new List<Class>();
    }
}
