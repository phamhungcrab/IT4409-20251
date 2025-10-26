using System;

namespace Api.Models.DTOs.Exam
{
    /// <summary>
    /// Request body for publishing an exam.  Publishing snapshots
    /// the questions and options into QuestionExam and makes the
    /// exam available to assigned students.  Additional options
    /// such as delayed publication or sending notifications may be
    /// included here.  For now this DTO is minimal; expand as
    /// needed.
    /// </summary>
    public class PublishExamRequest
    {
        /// <summary>
        /// Optional UTC timestamp indicating when the exam should be
        /// published.  If null, the exam is published immediately.
        /// </summary>
        public DateTime? PublishAtUtc { get; set; }

        /// <summary>
        /// Whether to send notifications to assigned students upon
        /// publication.  The backend may ignore this flag if
        /// notifications are handled elsewhere.
        /// </summary>
        public bool SendNotifications { get; set; } = false;
    }
}