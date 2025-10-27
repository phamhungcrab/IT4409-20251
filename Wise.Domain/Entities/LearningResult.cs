using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Wise.Domain.Entities
{
    public class LearningResult
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public int LessonId { get; set; }
        public double Score { get; set; } = 0;
        public double Accuracy { get; set; } = 0;
        public int TimeSpent { get; set; } = 0; // phút
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? User { get; set; }
        public Lesson? Lesson { get; set; }
    }
}
