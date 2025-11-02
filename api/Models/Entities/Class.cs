using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // 👈 THÊM
// ...

namespace Api.Models.Entities
{
    public class Class
    {
        public int Id { get; set; }
        public string? ClassCode { get; set; }
        public string Name { get; set; } = string.Empty;

        public int SubjectId { get; set; }

        public int? TeacherId { get; set; }

        public virtual Subject Subject { get; set; } = null!;

        // 👇 RÀNG BUỘC RÕ RÀNG QUAN HỆ GIÁO VIÊN
        [ForeignKey(nameof(TeacherId))]
        [InverseProperty(nameof(User.ClassesTeaching))]
        public virtual User? Teacher { get; set; }

        public virtual ICollection<Exam> Exams { get; set; } = new List<Exam>();

        // Học sinh học lớp (M-N)
        // InverseProperty sẽ được đặt ở phía User.EnrolledClasses (bên kia)
        public virtual ICollection<User> Students { get; set; } = new List<User>();

        public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
    }
}
