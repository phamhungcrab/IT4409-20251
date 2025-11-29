using OnlineExam.Application.Dtos.Class;
using OnlineExam.Application.Dtos.RequestDtos.User;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface IClassService : ICrudService<Class>
    {

        public Task<ResultApiModel> GetByTeacherAndSubject(int? teacherId, int? subjectId);
        public Task<ResultApiModel> CreateAsync(CreateClassDto newClass);
        public Task<ResultApiModel> AddStudentsAsync(AddStudentDto[] students, int classId);
        public Task<ResultApiModel> UpdateAsync(UpdateClassDto updateClass, int classId);
        

    }
}
