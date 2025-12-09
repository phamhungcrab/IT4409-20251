using Microsoft.Identity.Client;
using OnlineExam.Application.Dtos.Class;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class ClassService : CrudService<Class>, IClassService
    {
        private readonly IUserService _userService;
        private readonly IRepository<StudentClass> _studentClassRepo;
        private readonly ISubjectService _subjectService;
        private readonly IRepository<User> _studentRepo;

        public ClassService(IRepository<Class> repository
                            , IUserService userService ,
                            IRepository<StudentClass> studentClassRepo,
                            ISubjectService subjectService,
                            IRepository<User> studentRepo
            ) : base(repository)
        {
            _userService = userService;
            _studentClassRepo = studentClassRepo;
            _subjectService = subjectService;
            _studentRepo = studentRepo;
        }

        /// <summary>
        /// tim class theo dieu kien teacherId hoac subjectId
        /// </summary>
        /// <param name="teacherId"></param>
        /// <param name="subjectId"></param>
        /// <returns></returns>
        public async Task<ResultApiModel> GetByTeacherAndSubject(int? teacherId = null, int? subjectId = null)
        {
            
            var sClass = await _repository.FindAsync(c => (subjectId == null ? true : c.SubjectId.Equals(subjectId))
                                                     &&(teacherId) == null ? true: c.TeacherId.Equals(teacherId),
                                                     "Teacher", "Subject", "StudentClasses", "Exams"
                                                     );
           
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = sClass
            };


        }
        
        
        

        public async Task<ResultApiModel> GetStudents(int classId)
        {
            var curClass = await GetByIdAsync(classId);
            if (curClass == null)
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tìm thấy lớp"
                };
            var student =await  _studentClassRepo
                .JoinAsync<User, int, User>(
                    outer => outer.StudentId,
                    inner => inner.Id,
                    c => c.ClassId == classId,
                    (outer, inner) => inner
                );

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = student
            };

        }
        
        
        
        
        /// <summary>
        /// them sinh vien vao lop
        /// </summary>
        /// <param name="students"> Ds gofm mssv va email</param>
        /// <param name="classId">Id cua lop</param>
        /// <returns>sinh vien ko them duoc</returns>
        public async Task<ResultApiModel> AddStudentsAsync(AddStudentDto[] students, int classId)
        {
            List<AddStudentDto> invalidStudents = new List<AddStudentDto>();
            var curClass = await this.GetByIdAsync(classId);
            if (curClass == null) return new ResultApiModel
            {
                Status = false,
                MessageCode = ResponseCode.NotFound,
                Data = "Lớp không tồn tại"
            };
            foreach (var item in students)
            {
                var student = await _userService.GetUserByEmail(item.Email);
                // svien khong ton tai hoac khong khop email - mssv
                if(student == null || !student.MSSV.Equals(item.MSSV) || student.Role != UserRole.STUDENT)
                {
                    invalidStudents.Add(item);
                    continue;
                }

                else
                {
                    var studentClass = new StudentClass
                    {
                        StudentId = student.Id,
                        ClassId = classId
                        
                    };
                    await _studentClassRepo.AddAsync(studentClass);
                }

            }
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = invalidStudents.ToArray()
            };
            
        }

        public async Task<ResultApiModel> CreateAsync(CreateClassDto newClass)
        {
            
                var teacher = await _userService.GetByIdAsync((int)newClass.TeacherId);

                if (teacher == null || teacher.Role != UserRole.TEACHER)
                    return new ResultApiModel
                    {
                        Status = false,
                        MessageCode = ResponseCode.NotFound,
                        Data = "Không tìm thấy giáo viên",
                    };

                var subject = await _subjectService.GetByIdAsync(newClass.SubjectId);
                if (subject == null)
                    return new ResultApiModel
                    {
                        Status = false,
                        MessageCode = ResponseCode.NotFound,
                        Data = "Không tìm thấy môn học",
                    };
                var nClass = new Class
                {
                    Name = newClass.Name,
                    TeacherId = newClass.TeacherId,
                    SubjectId = newClass.SubjectId,
                };
                await base.CreateAsync(nClass);
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = nClass
            };
        }

        public async Task<ResultApiModel> UpdateAsync(UpdateClassDto updateClass, int classId)
        {
            var teacher = await _userService.GetByIdAsync((int)updateClass.TeacherId);

            if (teacher == null || teacher.Role != UserRole.TEACHER)
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tìm thấy giáo viên",
                };

            var subject = await _subjectService.GetByIdAsync(updateClass.SubjectId);
            if (subject == null)
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tìm thấy môn học",
                };

            var curClass = await base.GetByIdAsync(classId);
            if (curClass == null)
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tìm thấy lớp"
                };

            curClass.TeacherId = updateClass.TeacherId;
            curClass.SubjectId = updateClass.SubjectId;
            curClass.Name = updateClass.Name;

            await base.UpdateAsync(curClass);
            
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = curClass
            };
        }
    }
}
