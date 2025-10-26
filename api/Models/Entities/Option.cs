using System;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents a possible answer option for a question.  For
    /// multiple choice questions there can be multiple correct
    /// options.  Correctness should be stored in a separate
    /// association or via the IsCorrect flag.  When a question is
    /// snapshotted into an exam, its options are frozen along
    /// with their order and correctness.
    /// </summary>
    public class Option
    {
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the question this option belongs to.
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// The visible text of the option.
        /// </summary>
        public string Text { get; set; } = string.Empty;

        /// <summary>
        /// Indicates whether this option is correct for the canonical
        /// question.  For multi choice questions multiple options
        /// may be correct.  In the exam snapshot this flag will be
        /// frozen and used for auto grading.
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Optional order index used to sort options.  Randomization
        /// should occur per student and stored in StudentQuestion.
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// Navigation property back to the parent question.
        /// </summary>
        public virtual Question Question { get; set; } = null!;
    }
}