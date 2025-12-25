using OnlineExam.Application.Dtos.ExamDtos;
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
    }
}
