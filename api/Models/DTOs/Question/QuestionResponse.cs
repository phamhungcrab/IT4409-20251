using System.Collections.Generic;

namespace Api.Models.DTOs.Question
{
    /// <summary>
    /// Response payload for a question.  Contains the question text,
    /// type, optional explanation and a list of answer options.  For
    /// student-facing responses the IsCorrect property should not
    /// be populated to avoid leaking answers.  Teachers may see
    /// IsCorrect values when managing the question bank.
    /// </summary>
    public class QuestionResponse
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Explanation { get; set; }

        public List<OptionResponse> Options { get; set; } = new List<OptionResponse>();

        /// <summary>
        /// DTO representing an answer option.  The IsCorrect flag
        /// should be included only in teacher/admin contexts.  Clients
        /// should not rely on the presence of this property.
        /// </summary>
        public class OptionResponse
        {
            public int Id { get; set; }
            public string Text { get; set; } = string.Empty;
            public bool? IsCorrect { get; set; }
            public int Order { get; internal set; }
        }
    }
}