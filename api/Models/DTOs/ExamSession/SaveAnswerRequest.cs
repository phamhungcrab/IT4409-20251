using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.ExamSession
{
    /// <summary>
    /// Request body for saving a student’s answer during an exam.
    /// Supports both objective (single/multi choice) and essay
    /// question types.  At least one of SelectedOptionIds or
    /// EssayAnswer must be provided depending on the question type.
    /// </summary>
    public class SaveAnswerRequest
    {
        /// <summary>
        /// Identifier of the exam-student assignment.  Required so
        /// that the service knows which session to update.
        /// </summary>
        [Required]
        public int ExamStudentId { get; set; }

        /// <summary>
        /// Identifier of the question snapshot being answered.
        /// </summary>
        [Required]
        public int QuestionExamId { get; set; }

        /// <summary>
        /// Selected option IDs for objective questions.  For multi
        /// choice questions include all selected options.  For single
        /// choice, provide a single element.  Should be null for
        /// essay questions.
        /// </summary>
        public List<int>? SelectedOptionIds { get; set; }

        /// <summary>
        /// Free form answer text for essay questions.  Should be
        /// null for objective questions.
        /// </summary>
        public string? EssayAnswer { get; set; }

    }
}