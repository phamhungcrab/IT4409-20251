using System;
using System.Collections.Generic;
using Api.Models.Enumerations;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents a question in the question bank.  Questions may
    /// belong to a subject and are created by teachers or admins.
    /// Questions can be of various types such as single choice,
    /// multiple choice or essay.  Options and correct answers are
    /// stored separately.  When an exam is published, a snapshot
    /// of the question is taken into QuestionExam to preserve
    /// immutability.
    /// </summary>
    public class Question
    {
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the subject this question belongs to.
        /// </summary>
        public int SubjectId { get; set; }
        /// <summary>
        /// The main text of the question.
        /// </summary>
        public string Text { get; set; } = string.Empty;

        /// <summary>
        /// Type of the question (e.g., "SINGLE_CHOICE", "MULTI_CHOICE", "ESSAY").
        /// Using a string here allows adding new types without changing
        /// the code.  Alternatively an enum can be used.
        /// </summary>
        public QuestionType Type { get; set; }

        /// <summary>
        /// Optional explanation or additional instructions.
        /// </summary>
        public string? Explanation { get; set; }
        /// <summary>
        /// Navigation property to the subject.
        /// </summary>
        public virtual Subject Subject { get; set; } = null!;

        /// <summary>
        /// Collection of answer options associated with this question.
        /// For essay questions this collection may be empty.
        /// </summary>
        public virtual ICollection<Option> Options { get; set; } = new List<Option>();

        /// <summary>
        /// Exams that reference this question via snapshots.  This
        /// navigation is optional but can be useful for analytics.
        /// </summary>
        public virtual ICollection<QuestionExam> QuestionExams { get; set; } = new List<QuestionExam>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
        
    }
}