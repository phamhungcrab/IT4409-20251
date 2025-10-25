using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Models.DTOs.Result;

namespace Api.Services.Interfaces
{
    /// <summary>
    /// Provides operations for grading exams.  The grading service
    /// supports automatic scoring of objective questions as well as
    /// manual grading of essay questions.  Once grading is
    /// completed, the results can be finalized and made visible
    /// according to the result visibility policy.【329956817899352†L59-L84】
    /// </summary>
    public interface IGradingService
    {
        /// <summary>
        /// Grade a student's exam attempt.  The request contains a
        /// list of per‑question grades for essay questions.  Objective
        /// questions may have been auto graded already; the
        /// implementation should merge manual scores with auto
        /// scores and update the total.  The graderId identifies
        /// the teacher or admin performing the grading.
        /// </summary>
        Task<ResultResponse> GradeExamAsync(GradeRequest request, int graderId);

        /// <summary>
        /// Finalize grading for an exam attempt.  This signals that
        /// the grading is complete and prevents further changes
        /// unless special override permissions exist.  This method
        /// may trigger notifications to students and update audit
        /// logs.
        /// </summary>
        Task<ResultResponse> FinalizeGradingAsync(int examStudentId, int graderId);

        /// <summary>
        /// Retrieve the result of a specific exam attempt by its
        /// identifier.  Students may only access their own results
        /// while teachers and admins may access any result.
        /// </summary>
        Task<ResultResponse> GetResultByExamStudentIdAsync(int examStudentId);

        /// <summary>
        /// Retrieve all results for a given exam.  For large exams
        /// this method should support pagination or streaming.
        /// </summary>
        Task<IReadOnlyList<ResultResponse>> GetResultsByExamIdAsync(int examId);
    }
}