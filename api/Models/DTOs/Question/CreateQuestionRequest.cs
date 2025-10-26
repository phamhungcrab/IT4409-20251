using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.Question
{
    /// <summary>
    /// Request body for creating a new question.  Supports single
    /// choice, multiple choice and essay questions.  Includes
    /// optional explanation and a list of answer options for
    /// objective types.  The correct options should have
    /// IsCorrect set to true for auto grading.
    /// </summary>
    public class CreateQuestionRequest
    {
        /// <summary>
        /// Subject identifier that this question belongs to.
        /// </summary>
        [Required]
        public int SubjectId { get; set; }

        /// <summary>
        /// The question text.
        /// </summary>
        [Required]
        public string Text { get; set; } = string.Empty;

        /// <summary>
        /// Type of the question: "SINGLE_CHOICE", "MULTI_CHOICE",
        /// or "ESSAY".  The service layer may validate allowed values.
        /// </summary>
        [Required]
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Optional explanation or hint shown after answering.
        /// </summary>
        public string? Explanation { get; set; }

        /// <summary>
        /// List of answer options.  For essay questions this list
        /// should be empty.  For multi choice questions at least one
        /// option must have IsCorrect = true.
        /// </summary>
        public List<OptionDto> Options { get; set; } = new List<OptionDto>();

        /// <summary>
        /// Represents an answer option in the request.  Includes the
        /// option text and whether it is correct.  Use this nested
        /// class to avoid polluting the outer namespace.
        /// </summary>
        public class OptionDto
        {
            [Required]
            public string Text { get; set; } = string.Empty;
            public bool IsCorrect { get; set; }
            public int Order { get; set; }

        }
    }
}