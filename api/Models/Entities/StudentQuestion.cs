using System;
using System.Collections.Generic;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents a specific question presented to a student during an
    /// exam session.  Links the question snapshot (QuestionExam)
    /// with the student’s assignment (ExamStudent).  Stores the
    /// randomized order index and may record the student’s answer(s)
    /// directly or via the Answer entity.  Scoring information per
    /// question can also be stored here.
    /// </summary>
    public class StudentQuestion
    {
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the exam-student assignment.
        /// </summary>
        public int ExamStudentId { get; set; }
;
        /// <summary>
        /// Foreign key to the question snapshot.
        /// </summary>
        public int QuestionExamId { get; set; }
;
        /// <summary>
        /// Order in which this question should appear for the student.
        /// Each student can have a different order.  Stored to
        /// reproduce the exact exam attempt for review.
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// Optional selected option IDs as a serialized value (e.g.,
        /// comma-separated or JSON array).  For essay questions this
        /// property may be null.
        /// </summary>
        public string? SelectedOptionIds { get; set; }
;
        /// <summary>
        /// Optional free text answer for essay questions.
        /// </summary>
        public string? EssayAnswer { get; set; }
;
        /// <summary>
        /// Score awarded for this question.  Null if not yet graded.
        /// </summary>
        public decimal? Score { get; set; }
;
        /// <summary>
        /// Navigation to the exam-student assignment.
        /// </summary>
        public virtual ExamStudent ExamStudent { get; set; } = null!;

        /// <summary>
        /// Navigation to the question snapshot.
        /// </summary>
        public virtual QuestionExam QuestionExam { get; set; } = null!;

        /// <summary>
        /// Collection of answer versions.  A student may update their
        /// answer multiple times during the exam.  The latest
        /// AnswerData should be considered final.
        /// </summary>
        public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }
}