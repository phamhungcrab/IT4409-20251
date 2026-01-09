using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using OnlineExam.Application.Dtos.ClassDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.UserDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Infrastructure.Policy.Requirements;
using System.Security.Claims;

namespace OnlineExam.Application.Services
{
    public class ClassService : CrudService<Class>, IClassService
    {
        private readonly IUserService _userService;
        private readonly IRepository<StudentClass> _studentClassRepo;
        private readonly ISubjectService _subjectService;
        private readonly IRepository<User> _studentRepo;
        private readonly IAuthorizationService _authorizationService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ClassService(IRepository<Class> repository
                            , IUserService userService ,
                            IRepository<StudentClass> studentClassRepo,
                            ISubjectService subjectService,
                            IRepository<User> studentRepo,
                            IAuthorizationService authorizationService,
                            IHttpContextAccessor httpContextAccessor

            ) : base(repository)
        {
            _userService = userService;
            _studentClassRepo = studentClassRepo;
            _subjectService = subjectService;
            _studentRepo = studentRepo;
            _authorizationService = authorizationService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ResultApiModel> SearchForAdminAsync(Dtos.SearchClassDtos.SearchClassDto searchModel)
        {
            var query = _repository.Query();
            if (!string.IsNullOrEmpty(searchModel.Name))
            {
                var name = searchModel.Name.ToLower().Trim();
                query = query.Where(c => c.Name.ToLower().Trim().Contains(name));
            }

            if (searchModel.TeacherId != null)
            {
                query = query.Where(c => c.TeacherId == searchModel.TeacherId);
            }

            if (searchModel.SubjectId != null)
            {
                query = query.Where(c => c.SubjectId == searchModel.SubjectId);
            }

            
            var totalItems = await query.CountAsync();

            var classes = await query
                .Skip((searchModel.PageNumber - 1) * searchModel.PageSize)
                .Take(searchModel.PageSize)
                .Select(c => new ClassDto(c))
                .ToListAsync();

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new
                {
                    TotalItems = totalItems,
                    Users = classes
                }
            };

        }


        
        /// <summary>
        /// tim class theo dieu kien teacherId hoac subjectId
        /// </summary>
        /// <param name="teacherId"></param>
        /// <param name="subjectId"></param>
        /// <returns></returns>
        public async Task<ResultApiModel> GetByTeacherAndSubject(int teacherId , int? subjectId = null)
        {

            var authResult = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, teacherId, new ResourceRequirement(ResourceAction.ViewDetail));
            if (!authResult.Succeeded)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Forbidden

                };
            }
            var sClass = (await _repository.FindAsync(c => (subjectId == null ? true : c.SubjectId.Equals(subjectId))
                                                     &&c.TeacherId.Equals(teacherId),
                                                     "Teacher", "Subject", "Exams"
                                                     ))
                                                     .Select(c => new ClassDto(c))
                                                     .ToList();
            
     
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = sClass
            };


        }

        /// <summary>
        /// lay dsach lop sinh vien dang hoc
        /// </summary>
        /// <param name="studentId"></param>
        /// <returns></returns>
        public async Task<ResultApiModel> GetClassesForCurrentStudent(int studentId)
        {

            //admin van qua dc
            var authResult = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, studentId, new ResourceRequirement(ResourceAction.ViewDetail));
            if (!authResult.Succeeded)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Forbidden

                };
            }

            var sClass = (await _studentClassRepo.FindAsync(c => c.StudentId == studentId,
                                                     "Class", "Student", "Class.Subject", "Class.Teacher"
                                                     ))
                                                     .Where(c => c.Class != null)
                                                     .Select(c => new ClassDto(c.Class))
                                                     .ToList();


            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = sClass
            };


        }


        public async Task<ResultApiModel> GetStudents(int classId)
        {
            var curClass = await GetByIdAsync(classId, ["StudentClasses"]);
            if (curClass == null)
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tìm thấy lớp"
                };
            var authResult = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, curClass, new ResourceRequirement(ResourceAction.ViewDetail));
            if(!authResult.Succeeded)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Forbidden
                    
                };
            }
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
                Data = student.Select(c => new UserDto(c))
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
            var curClass = await this.GetByIdAsync(classId, ["StudentClasses"]);
            var authResult = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, curClass, new ResourceRequirement(ResourceAction.Edit));
            if (!authResult.Succeeded)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Forbidden

                };
            }
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
                    bool exists = curClass.StudentClasses.Any(sc => sc.StudentId == student.Id && sc.ClassId == classId); 
                    if (exists) 
                    {
                        invalidStudents.Add(item);
                        continue;
                    }
                    var studentClass = new StudentClass
                    {
                        StudentId = student.Id,
                        ClassId = classId
                        
                    };
                   
                        try
                    {

                        await _studentClassRepo.AddAsync(studentClass);
                        await _studentClassRepo.SaveChangesAsync();
                    }
                    catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && sqlEx.Number == 2601)
                    {

                    }

                }

            }
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = invalidStudents.ToArray()
            };
            
        }
        public async Task<ResultApiModel> AddStudentAsync(AddStudentDto student, int classId)
        {
            var curClass = await this.GetByIdAsync(classId, ["StudentClasses"]);
            var authResult = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, curClass, new ResourceRequirement(ResourceAction.ViewDetail));
            if (!authResult.Succeeded)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Forbidden

                };
            }
            if (curClass == null) return new ResultApiModel
            {
                Status = false,
                MessageCode = ResponseCode.NotFound,
                Data = "Lớp không tồn tại"
            };
            
                var s= await _userService.GetUserByEmail(student.Email);
                // svien khong ton tai hoac khong khop email - mssv
                if (s == null || !s.MSSV.Equals(student.MSSV) || s.Role != UserRole.STUDENT)
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Sai thông tin sinh viên"
                };

            else
                {
                    var studentClass = new StudentClass
                    {
                        StudentId = s.Id,
                        ClassId = classId

                    };
                try
                {
                    await _studentClassRepo.AddAsync(studentClass);
                    await _studentClassRepo.SaveChangesAsync();
                }
                catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && sqlEx.Number == 2601)
                {

                }
            }


            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = student
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
                Data = newClass
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
            var authResult = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, curClass, new ResourceRequirement(ResourceAction.ViewDetail));
            if (!authResult.Succeeded)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Forbidden

                };
            }
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
