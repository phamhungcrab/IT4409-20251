using OnlineExam.Application.Dtos.Exam;
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
        Task<ExamGenerateResultDto> GenerateExamAsync(CreateExamForStudentDto dto);
        Task<ExamStudent?> GetExamStudent(int examId, int studentId);
        Task<List<Exam>> GetStudentExamsAsync(int studentId);
        Task<List<Exam>> GetAllExamsAsync();
        Task SubmitExamAsync(ExamSubmissionDto dto);
        Task<List<ExamStudent>> GetResultsByStudentAsync(int studentId);
        Task<ExamStudent?> GetResultDetailAsync(int examId, int studentId);
    }
}
