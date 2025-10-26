using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.ExamSession
{
    /// <summary>
    /// Request body for starting an exam session.  The current
    /// student (derived from the authentication token) indicates
    /// which exam they are starting.  The service will verify
    /// assignment and return a materialized exam snapshot.
    /// </summary>
    public class StartExamRequest
    {
        /// <summary>
        /// Identifier of the exam being started.
        /// </summary>
        [Required]
        public int ExamId { get; set; }

        /// <summary>
        /// Optional field to support rejoining an existing session
        /// after a reconnect.  Pass the ExamStudentId if the
        /// session was previously started.
        /// </summary>
        public int? ExamStudentId { get; set; }

    }
}