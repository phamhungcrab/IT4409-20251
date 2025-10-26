using System;
using System.Collections.Generic;
using Api.Models.DTOs.Question;

namespace Api.Models.DTOs.Result
{
    /// <summary>
    /// Response payload for a student’s exam result.  Includes
    /// high-level scores and detailed per-question information.  Some
    /// fields, such as correct answers, may be omitted for student
    /// viewers but available for teachers and admins.
    /// </summary>
    public class ResultResponse
    {
        public int ExamId { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public decimal ObjectiveScore { get; set; }
        public decimal SubjectiveScore { get; set; }
        public decimal TotalScore { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? StartedAtUtc { get; set; }
        public DateTime? EndedAtUtc { get; set; }
        public DateTime? SubmittedAtUtc { get; set; }
        public List<QuestionResultDto> Questions { get; set; } = new List<QuestionResultDto>();

        /// <summary>
        /// Represents the result of a single question for a student.
        /// Includes the student’s answer, score and optional
        /// commentary.  Correct answer information should be omitted
        /// for students until after grading release.
        /// </summary>
        public class QuestionResultDto
        {
            public int QuestionExamId { get; set; }
            public string Text { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public string? Explanation { get; set; }

            public decimal? Score { get; set; }
            public bool? IsCorrect { get; set; }

            /// <summary>
            /// Selected option IDs as provided by the student.
            /// </summary>
            public List<int>? SelectedOptionIds { get; set; }

            /// <summary>
            /// Student’s essay answer, if applicable.
            /// </summary>
            public string? EssayAnswer { get; set; }

            /// <summary>
            /// Optional feedback or comment from the grader.
            /// </summary>
            public string? Comment { get; set; }

            /// <summary>
            /// For teacher/admin viewers: the correct answer(s) for
            /// this question.  Use the same structure as in
            /// <see cref="QuestionResponse"/> if needed.  This
            /// property should be null for students.
            /// </summary>
            public object? CorrectAnswer { get; set; }
        }
    }
}