using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models.DTOs.Result;
using Api.Models.Entities;
using Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Api.Data;

namespace Api.Services
{
    /// <summary>
    /// Implements exam grading operations.  This service updates
    /// per‑question scores, computes totals and exposes result
    /// retrieval methods.  The implementation here is simplified
    /// and does not account for objective/subjective separation or
    /// partial credit rules.
    /// </summary>
    public class GradingService : IGradingService
    {
        private readonly ApplicationDbContext _dbContext;

        public GradingService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <inheritdoc />
        public async Task<ResultResponse> GradeExamAsync(GradeRequest request, int graderId)
        {
            // Iterate through each question grade and update
            foreach (var qGrade in request.QuestionGrades)
            {
                var studentQuestion = await _dbContext.StudentQuestions
                    .Include(sq => sq.ExamStudent)
                    .ThenInclude(es => es.Score)
                    .FirstOrDefaultAsync(sq => sq.Id == qGrade.StudentQuestionId);
                if (studentQuestion == null) continue;
                // Update per‑question score
                studentQuestion.Score = qGrade.Score;
                // TODO: Store grader comment (not currently modeled)
            }
            await _dbContext.SaveChangesAsync();
            // Compute updated totals per ExamStudent
            foreach (var qGrade in request.QuestionGrades)
            {
                var studentQuestion = await _dbContext.StudentQuestions
                    .Include(sq => sq.ExamStudent)
                    .ThenInclude(es => es.StudentQuestions)
                    .ThenInclude(sq => sq.QuestionExam)
                    .FirstOrDefaultAsync(sq => sq.Id == qGrade.StudentQuestionId);
                if (studentQuestion == null) continue;
                var examStudent = studentQuestion.ExamStudent;
                // Sum all question scores for this examStudent
                decimal total = examStudent.StudentQuestions.Sum(sq => sq.Score ?? 0);
                // Ensure Score summary exists
                var summary = await _dbContext.Scores.SingleOrDefaultAsync(s => s.ExamStudentId == examStudent.Id);
                if (summary == null)
                {
                    summary = new Score
                    {
                        ExamStudentId = examStudent.Id,
                        ObjectiveScore = 0, // TODO: derive from auto graded questions
                        SubjectiveScore = total,
                        TotalScore = total,
                        IsFinal = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _dbContext.Scores.Add(summary);
                }
                else
                {
                    summary.SubjectiveScore = total;
                    summary.TotalScore = summary.ObjectiveScore + total;
                    summary.UpdatedAt = DateTime.UtcNow;
                    summary.IsFinal = false;
                }
                examStudent.TotalScore = summary.TotalScore;
            }
            await _dbContext.SaveChangesAsync();
            // Return result for the first affected examStudent (for demonstration)
            var firstId = request.QuestionGrades.First().StudentQuestionId;
            var firstStudentQuestion = await _dbContext.StudentQuestions.Include(sq => sq.ExamStudent).FirstAsync(sq => sq.Id == firstId);
            return await GetResultByExamStudentIdAsync(firstStudentQuestion.ExamStudentId);
        }

        /// <inheritdoc />
        public async Task<ResultResponse> FinalizeGradingAsync(int examStudentId, int graderId)
        {
            var summary = await _dbContext.Scores.SingleOrDefaultAsync(s => s.ExamStudentId == examStudentId);
            if (summary == null)
            {
                throw new InvalidOperationException("Exam must be graded before finalizing");
            }
            summary.IsFinal = true;
            summary.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return await GetResultByExamStudentIdAsync(examStudentId);
        }

        /// <inheritdoc />
        public async Task<ResultResponse> GetResultByExamStudentIdAsync(int examStudentId)
        {
            var examStudent = await _dbContext.ExamStudents
                .Include(es => es.Exam)
                .Include(es => es.Student)
                .Include(es => es.StudentQuestions)
                    .ThenInclude(sq => sq.QuestionExam)
                .Include(es => es.Score)
                .SingleOrDefaultAsync(es => es.Id == examStudentId);
            if (examStudent == null)
            {
                throw new KeyNotFoundException($"ExamStudent {examStudentId} not found");
            }
            var result = new ResultResponse
            {
                ExamId = examStudent.ExamId,
                ExamTitle = examStudent.Exam.Title,
                StudentId = examStudent.StudentId,
                StudentName = examStudent.Student.FullName ?? examStudent.Student.Email,
                ObjectiveScore = examStudent.Score?.ObjectiveScore ?? 0,
                SubjectiveScore = examStudent.Score?.SubjectiveScore ?? 0,
                TotalScore = examStudent.Score?.TotalScore ?? examStudent.TotalScore ?? 0,
                Status = examStudent.Status,
                StartedAtUtc = examStudent.StartTime,
                EndedAtUtc = examStudent.EndTime,
                SubmittedAtUtc = examStudent.SubmittedAt
            };
            // Populate question results
            foreach (var sq in examStudent.StudentQuestions.OrderBy(sq => sq.Order))
            {
                var qr = new ResultResponse.QuestionResultDto
                {
                    QuestionExamId = sq.QuestionExamId,
                    Text = sq.QuestionExam.Text,
                    Type = sq.QuestionExam.Type.ToString(),
                    Explanation = sq.QuestionExam.Explanation,
                    Score = sq.Score,
                    SelectedOptionIds = sq.SelectedOptionIds?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList(),
                    EssayAnswer = sq.EssayAnswer,
                    // TODO: Provide IsCorrect and CorrectAnswer for teachers
                };
                result.Questions.Add(qr);
            }
            return result;
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<ResultResponse>> GetResultsByExamIdAsync(int examId)
        {
            var assignments = await _dbContext.ExamStudents.Where(es => es.ExamId == examId).ToListAsync();
            var results = new List<ResultResponse>();
            foreach (var es in assignments)
            {
                results.Add(await GetResultByExamStudentIdAsync(es.Id));
            }
            return results;
        }
    }
}