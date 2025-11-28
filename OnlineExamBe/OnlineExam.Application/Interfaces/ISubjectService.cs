using OnlineExam.Application.Dtos.Subject;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface ISubjectService : ICrudService<Subject>
    {
        Task<bool> AddListSubject(CreateSubjectDto[] dto);
        Task<Subject?> GetByCodeAsync(String code);
    }
}
