using System;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents the scoring summary for a student’s exam attempt.
    /// Stores objective (auto graded) and subjective (manual) scores
    /// separately and tracks whether the grading is final.  Scores
    /// can be updated by teachers until finalized.  This entity
    /// complements the TotalScore field on ExamStudent for more
    /// detailed reporting.
    /// </summary>
    public class Score
    {
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the exam-student assignment.
        /// </summary>
        public int ExamStudentId { get; set; }

        /// <summary>
        /// Sum of scores for objective questions (auto graded).
        /// </summary>
        public decimal ObjectiveScore { get; set; }

        /// <summary>
        /// Sum of scores for subjective questions (manually graded).
        /// </summary>
        public decimal SubjectiveScore { get; set; }

        /// <summary>
        /// Combined total score (objective + subjective).  Should be
        /// computed whenever either component changes.
        /// </summary>
        public decimal TotalScore { get; set; }

        /// <summary>
        /// Indicates whether the score is finalized (no further
        /// changes allowed).  Teachers should set this after
        /// reviewing manual grades.
        /// </summary>
        public bool IsFinal { get; set; }

        /// <summary>
        /// Timestamp when the score record was created.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Timestamp when the score was last updated.
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Navigation to the exam-student assignment.
        /// </summary>
        public virtual ExamStudent ExamStudent { get; set; } = null!;
    }
}