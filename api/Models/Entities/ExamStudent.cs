using System;
using System.Collections.Generic;

namespace Api.Models.Entities
{
    /// <summary>
    /// Associates a student with an exam assignment.  Tracks the
    /// status of the student’s attempt and timing information.  The
    /// relationship is unique per exam and student.  Additional
    /// metadata such as score and submission timestamps are stored
    /// here to support reporting and monitoring.
    /// </summary>
    public class ExamStudent
    {
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the exam.
        /// </summary>
        public int ExamId { get; set; }

        /// <summary>
        /// Foreign key to the student user.
        /// </summary>
        public int StudentId { get; set; }

        /// <summary>
        /// Status of the exam attempt (e.g., "IN_PROGRESS",
        /// "COMPLETED", "EXPIRED").  Using a string here allows
        /// flexibility; a lookup table or enum can be used instead.
        /// </summary>
        public string Status { get; set; } = "IN_PROGRESS";

        /// <summary>
        /// Timestamp when the student started the exam (UTC).  Null
        /// until the student actually begins.
        /// </summary>
        public DateTime? StartTime { get; set; }

        /// <summary>
        /// Timestamp when the student ended or submitted the exam
        /// (UTC).  Null if not yet finished.
        /// </summary>
        public DateTime? EndTime { get; set; }

        /// <summary>
        /// Timestamp when the exam was actually submitted.  This may
        /// differ from EndTime if autosave occurs.  Null if not yet
        /// submitted.
        /// </summary>
        public DateTime? SubmittedAt { get; set; }

        /// <summary>
        /// The final score achieved by the student.  May be null
        /// until grading completes.
        /// </summary>
        public decimal? TotalScore { get; set; }

        /// <summary>
        /// Navigation to the exam.
        /// </summary>
        public virtual Exam Exam { get; set; } = null!;

        /// <summary>
        /// Navigation to the student user.
        /// </summary>
        public virtual User Student { get; set; } = null!;

        /// <summary>
        /// Collection of per-question records for this student’s attempt.
        /// </summary>
        public virtual ICollection<StudentQuestion> StudentQuestions { get; set; } = new List<StudentQuestion>();

        /// <summary>
        /// Grading summary for this exam attempt.  This navigation is
        /// optional if scores are stored directly on this entity.
        /// </summary>
        public virtual Score? Score { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    }
}