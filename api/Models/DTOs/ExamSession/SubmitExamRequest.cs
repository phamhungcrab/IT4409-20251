using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.ExamSession
{
    /// <summary>
    /// Request body for submitting a completed exam.  The service
    /// will finalize the exam session, perform auto grading and
    /// transition the status to COMPLETED.  Optionally a force flag
    /// can be provided to override timeouts or other conditions.
    /// </summary>
    public class SubmitExamRequest
    {
        /// <summary>
        /// Identifier of the exam-student assignment to submit.
        /// </summary>
        [Required]
        public int ExamStudentId { get; set; }
;
        /// <summary>
        /// Indicates whether to force submission even if the exam
        /// duration has not elapsed or other validation fails.
        /// Use with caution.
        /// </summary>
        public bool Force { get; set; } = false;
    }
}