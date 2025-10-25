using System;
using System.Collections.Generic;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents the snapshot of a question as it exists within a
    /// particular exam.  When an exam is published, questions are
    /// copied from the question bank into this table so that
    /// subsequent edits to the original question do not affect the
    /// running exam.  Options and correct answers are serialized
    /// into JSON for immutability and rehydration during grading.
    /// </summary>
    public class QuestionExam
    {
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the exam this snapshot belongs to.
        /// </summary>
        public int ExamId { get; set; }
;
        /// <summary>
        /// Foreign key to the original question.  Useful for analytics
        /// but not used for grading.
        /// </summary>
        public int QuestionId { get; set; }
;
        /// <summary>
        /// Copy of the question text at the time of publication.
        /// </summary>
        public string QuestionText { get; set; } = string.Empty;

        /// <summary>
        /// Serialized JSON array of options including their order and
        /// correctness.  Use a JSON library to deserialize into a
        /// structured object when needed.  Storing as JSON preserves
        /// the original order and prevents modifications.
        /// </summary>
        public string OptionsJson { get; set; } = string.Empty;

        /// <summary>
        /// Serialized JSON representation of the correct answers.
        /// For single choice this is a single option ID; for multi
        /// choice this is an array of option IDs; for essays this may
        /// be null.
        /// </summary>
        public string? CorrectAnswersJson { get; set; }
;
        /// <summary>
        /// Order of the question within the exam.  The order should
        /// be preserved for each student but the frontend can shuffle
        /// this order per student and store it in StudentQuestion.
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// Navigation property back to the parent exam.
        /// </summary>
        public virtual Exam Exam { get; set; } = null!;

        /// <summary>
        /// Navigation property back to the original question.
        /// </summary>
        public virtual Question Question { get; set; } = null!;

        /// <summary>
        /// Student-specific questions referencing this snapshot.
        /// </summary>
        public virtual ICollection<StudentQuestion> StudentQuestions { get; set; } = new List<StudentQuestion>();
    }
}