using OnlineExam.Application.Dtos.ExamDtos;
using OnlineExam.Application.Dtos.ExamStudent;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.UserDtos;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface IExamService : ICrudService<Exam>
    {
        public Task<ResultApiModel> SearchForAdminAsync(SearchExamDto searchModel);
        Task<ExamGenerateResultDto> GenerateExamAsync(CreateExamForStudentDto dto);
        Task<ExamStudent?> GetExamStudent(int examId, int studentId);
        Task<ExamGenerateResultDto> GetCurrentQuestionForExam(int examId, int studentId);
        Task<ExamResultPreviewDto> GetDetailResultExam(int examId, int studentId);
        Task<ExamResultSummaryDto> GetResultSummary(int examId, int studentId);
        Task<IEnumerable<GetListExamForStudentDto>> GetListExamForStudent(int studentId);
        Task<ExamStudentsStatusResponse> GetPreviewScoreStudentsExam(int examId);
        Task RecordViolationAsync(RecordViolationDto dto);
        Task<bool> ForceSubmitAsync(int examId, int studentId);
    }
}
