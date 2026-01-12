using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    /// <summary>
    /// Records individual exam integrity violations by a student.
    /// </summary>
    public class ExamStudentViolation
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public int StudentId { get; set; }
        public ViolationType ViolationType { get; set; }
        public DateTime OccurredAt { get; set; }
        /// <summary>
        /// Duration of the violation in milliseconds (e.g., how long student was away).
        /// </summary>
        public int? DurationMs { get; set; }

        // Navigation properties
        public Exam? Exam { get; set; }
        public User? Student { get; set; }
    }
}
