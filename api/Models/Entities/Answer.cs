using System;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents a student’s answer for a question during an exam
    /// session.  Answers may be stored as JSON or another
    /// serialized format to support multiple choice and essay types.
    /// A question may have multiple answers over time due to
    /// autosave; the most recent record prior to submission should
    /// be used for grading.
    /// </summary>
    public class Answer
    {
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the student question this answer belongs to.
        /// </summary>
        public int StudentQuestionId { get; set; }

        /// <summary>
        /// Timestamp when this answer was recorded (UTC).
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Serialized representation of the answer data.  For multi
        /// choice questions this may be an array of option IDs.  For
        /// essays this may be plain text.  JSON is recommended to
        /// support complex data structures.
        /// </summary>
        public string AnswerData { get; set; } = string.Empty;

        /// <summary>
        /// Navigation to the student question.
        /// </summary>
        public virtual StudentQuestion StudentQuestion { get; set; } = null!;
    }
}