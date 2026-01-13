using OnlineExam.Application.Dtos.ClassDtos;
using OnlineExam.Application.Dtos.RequestDtos.UserDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.SearchClassDtos;
using OnlineExam.Application.Dtos.UserDtos;
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
        public Task<ResultApiModel> SearchForAdminAsync(Dtos.SearchClassDtos.SearchClassDto searchModel);
        public Task<ResultApiModel> GetByTeacherAndSubject(int teacherId, int? subjectId);
        public Task<ResultApiModel> GetClassesForCurrentStudent(int studentId);
        public Task<ResultApiModel> CreateAsync(CreateClassDto newClass);
        public Task<ResultApiModel> GetStudents(int classId);
        public Task<ResultApiModel> AddStudentsAsync(AddStudentDto[] students, int classId);
        public Task<ResultApiModel> AddStudentAsync(AddStudentDto student, int classId);
        public Task<ResultApiModel> RemoveStudentsAsync(int[] studentIds, int classId);
        public Task<ResultApiModel> RemoveStudentAsync(int student, int classId);
        public Task<ResultApiModel> UpdateAsync(UpdateClassDto updateClass, int classId);
        

    }
}
