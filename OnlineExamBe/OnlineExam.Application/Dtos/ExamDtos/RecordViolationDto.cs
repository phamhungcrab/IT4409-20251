using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    /// <summary>
    /// DTO for recording a violation event from the frontend.
    /// </summary>
    public class RecordViolationDto
    {
        public int ExamId { get; set; }
        public int StudentId { get; set; }
        /// <summary>
        /// Type of violation: "FOCUS_LOSS" or "FULLSCREEN_EXIT"
        /// </summary>
        public string ViolationType { get; set; } = string.Empty;
        /// <summary>
        /// Timestamp when the violation occurred (ISO 8601 format from client).
        /// </summary>
        public DateTime OccurredAt { get; set; }
        /// <summary>
        /// Duration of focus loss in milliseconds (optional).
        /// </summary>
        public int? DurationMs { get; set; }
    }
}
