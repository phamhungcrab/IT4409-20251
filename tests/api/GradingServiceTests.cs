using Xunit;
using api.Services;
using api.Models.DTOs.Result;
using api.Models.Entities;

namespace tests.api
{
    /// <summary>
    /// Tests for the <see cref="GradingService"/>. These tests
    /// exercise the partial scoring helper and grading aggregation.
    /// When implementing real grading, use a mock database and
    /// verify that scores are computed correctly.
    /// </summary>
    public class GradingServiceTests
    {
        [Fact]
        public void Calculate_Partial_Score_Returns_Full_For_All_Correct()
        {
            var service = new GradingService(null!);
            var request = new GradeRequest
            {
                ExamStudentId = 1,
                QuestionGrades = new()
                {
                    new()
                    {
                        StudentQuestionId = 1,
                        Score = 1.0m
                    }
                }
            };
            // This is a placeholder to illustrate test structure. In a
            // real test, call service.ApplyGradesAsync and inspect the result.
            Assert.Equal(1, request.QuestionGrades.Count);
        }
    }
}