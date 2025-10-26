using System;
using System.Collections.Generic;
using Api.Models.DTOs.User;
using Api.Models.DTOs.Question;

namespace Api.Models.DTOs.Exam
{
    /// <summary>
    /// Response payload for an exam.  Contains exam metadata,
    /// scheduling, publication status and optionally the detailed
    /// questions.  Teachers and admins may see full question
    /// details; students should receive a version without correct
    /// answers.  See <see cref="QuestionResponse"/> for the
    /// question structure.
    /// </summary>
    public class ExamResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public DateTime StartTimeUtc { get; set; }

        public DateTime EndTimeUtc { get; set; }

        public bool IsPublished { get; set; }

        public DateTime? PublishedAtUtc { get; set; }

        public UserResponse Author { get; set; } = new UserResponse();

        /// <summary>
        /// Optional list of question details for this exam.  For
        /// teacher/admin endpoints this list may include the
        /// IsCorrect flags; for student endpoints the flags should be
        /// null.  If null, callers can request question details
        /// separately.
        /// </summary>
        public List<QuestionResponse>? Questions { get; set; }

        /// <summary>
        /// Count of questions in the exam.  Useful when the
        /// Questions list is not populated.
        /// </summary>
        public int QuestionCount { get; set; }

    }
}