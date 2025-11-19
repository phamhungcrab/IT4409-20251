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
        Task<Exam?> GenerateExamAsync(CreateExamDto dto);
    }
}
