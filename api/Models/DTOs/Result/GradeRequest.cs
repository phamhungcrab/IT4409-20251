using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.Result
{
    /// <summary>
    /// Request body for grading or regrading a student’s exam.  The
    /// request contains a collection of per-question grades.  Each
    /// item identifies the student question and the new score and
    /// optional feedback.  Only teachers and admins should be able
    /// to submit this request.
    /// </summary>
    public class GradeRequest
    {
        [Required]
        public List<QuestionGradeDto> QuestionGrades { get; set; } = new List<QuestionGradeDto>();

        /// <summary>
        /// Represents a grade for a single question.  The Score
        /// should be a non-negative decimal value up to the question’s
        /// maximum points.  The Comment field can include
        /// explanations or rubric notes.
        /// </summary>
        public class QuestionGradeDto
        {
            [Required]
            public int StudentQuestionId { get; set; }

            [Required]
            [Range(0, double.MaxValue)]
            public decimal Score { get; set; }

            public string? Comment { get; set; }

        }
    }
}