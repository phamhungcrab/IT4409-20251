using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.Exam
{
    /// <summary>
    /// Request body for creating a new exam.  Includes metadata
    /// (title, description, schedule) and the list of question IDs
    /// that will compose the exam.  Optionally classes or students
    /// can be assigned at creation time via separate endpoints.
    /// </summary>
    public class CreateExamRequest
    {
        /// <summary>
        /// Title of the exam (e.g., "Midterm Exam").
        /// </summary>
        [Required]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Optional description or instructions for the exam.
        /// </summary>
        public string? Description { get; set; }
;
        /// <summary>
        /// UTC start time when the exam will become available.  Must
        /// precede EndTimeUtc.
        /// </summary>
        [Required]
        public DateTime StartTimeUtc { get; set; }
;
        /// <summary>
        /// UTC end time when the exam closes.  Students cannot
        /// submit after this time.
        /// </summary>
        [Required]
        public DateTime EndTimeUtc { get; set; }
;
        /// <summary>
        /// List of question IDs selected from the question bank to
        /// include in this exam.  At least one question must be
        /// provided.
        /// </summary>
        [Required]
        public List<int> QuestionIds { get; set; } = new List<int>();

        /// <summary>
        /// Optional list of class IDs to assign the exam to upon
        /// creation.  Assignment can also be performed via a separate
        /// endpoint.
        /// </summary>
        public List<int>? ClassIds { get; set; }
;
        /// <summary>
        /// Optional list of individual student IDs to assign the exam
        /// to.  Mutually exclusive with ClassIds.
        /// </summary>
        public List<int>? StudentIds { get; set; }
;
    }
}