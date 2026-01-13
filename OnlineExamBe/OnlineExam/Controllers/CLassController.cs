using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.ClassDtos;
using OnlineExam.Application.Dtos.RequestDtos.UserDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.SearchClassDtos;
using OnlineExam.Application.Dtos.UserDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services;
using OnlineExam.Attributes;
using OnlineExam.Domain.Enums;
using OnlineExam.Infrastructure.Policy.Requirements;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class CLassController : Controller
    {
        private readonly IClassService _classService;
        private readonly IAuthorizationService _authorizationService;
        public CLassController(IClassService classService, IAuthorizationService authorizationService) 
        {
            _classService = classService;
            _authorizationService = authorizationService;

        }
        //admin

        [HttpPost]
        [Route("search-for-admin")]
        [SessionAuthorize]
        public async Task<IActionResult> Search(Application.Dtos.SearchClassDtos.SearchClassDto search)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.SearchForAdminAsync(search);
            return Ok(apiResultModel);
        }
        
        [HttpGet]
        [Route("get-all")]
        [SessionAuthorize]
        public async Task<IActionResult> GetAll()
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel.Status = true;
            var classes = await _classService.GetAllAsync("Teacher", "Subject", "Exams");
            apiResultModel.Data = classes.Select(c => new ClassDto(c)).ToList();
            return Ok(apiResultModel);
        }
        [HttpGet]
        [Route("get-by-subject-for-teacher")]
        [SessionAuthorize("F0112")]
        public async Task<IActionResult> GetByTeacherAndSubject(int teacherId , int? subjectId = null )
        {
            
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.GetByTeacherAndSubject(teacherId, subjectId);
            if (apiResultModel.MessageCode == ResponseCode.Forbidden) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(apiResultModel);
        }

        [HttpGet]
        [Route("get-classes-for-student")]
        [SessionAuthorize("F0122")]
        public async Task<IActionResult> GetClassesForCurStudent(int studentId)
        {

            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.GetClassesForCurrentStudent(studentId);
            if (apiResultModel.MessageCode == ResponseCode.Forbidden) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(apiResultModel);
        }
        [HttpGet]
        [Route("get-by-id/{classId}")]
        [SessionAuthorize("F0122")]
        public async Task<IActionResult> GetById(int classId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            var c = await _classService.GetByIdAsync(classId, ["Teacher", "Subject", "Exams", "StudentClasses"]);
            var authResult = await _authorizationService.AuthorizeAsync(User, c, new ResourceRequirement(ResourceAction.ViewDetail));
            if (!authResult.Succeeded)
            {
                return Unauthorized("Forbidden: You do not have permission to perform this action.");
            }
            if (c != null)
            {
                apiResultModel.Status = true;
                apiResultModel.Data = new ClassDto(c);
            }
            return Ok(apiResultModel);
        }
        [HttpGet]
        [Route("get-students")]
        [SessionAuthorize("F0000")]
        public async Task<IActionResult> GetStudents(int classId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.GetStudents(classId);
            if (apiResultModel.MessageCode == ResponseCode.Forbidden) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(apiResultModel);
        }
        /// <summary>
        /// them sinh vien
        /// </summary>
        /// <param name="file"></param>
        /// <param name="classId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("add-users/{classId}")]
        [SessionAuthorize("F0113")]
        public async Task<IActionResult> AddStudents(IFormFile file,int classId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");
            var options = new JsonSerializerOptions
            {
                Converters = { new JsonStringEnumConverter() },
                PropertyNameCaseInsensitive = true
            };

            options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            string json = await reader.ReadToEndAsync();

            var listUser = JsonSerializer.Deserialize<AddStudentDto[]>(json,options);

            if (listUser == null)
                return BadRequest("Invalid JSON file");

            var result = await _classService.AddStudentsAsync(listUser, classId);
            if (result.MessageCode == ResponseCode.Forbidden) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(result);
        }

        [HttpPost]
        [Route("add-user/{classId}")]
        [SessionAuthorize("F0113")]
        public async Task<IActionResult> AddStudent(AddStudentDto student, int classId)
        {
            
            if (student == null)
                return BadRequest("Invalid JSON file");

            var result = await _classService.AddStudentAsync(student, classId);
            if (result.MessageCode == ResponseCode.Forbidden) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(result);
        }
        /// <summary>
        /// xoa sinh vien
        /// </summary>
        /// <param name="file"></param>
        /// <param name="classId"></param>
        /// <returns></returns>
        [HttpDelete]
        [Route("remove-users/{classId}")]
        [SessionAuthorize("F0113")]
        public async Task<IActionResult> RemoveStudents([FromQuery] int[] studentIds, int classId)
        {
            
            var result = await _classService.RemoveStudentsAsync(studentIds, classId);
            if (result.MessageCode == ResponseCode.Forbidden) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(result);
        }

        [HttpDelete]
        [Route("remove-user/{classId}/{studentId}")]
        [SessionAuthorize("F0113")]
        public async Task<IActionResult> RemoveStudent(int studentId, int classId)
        {
            var result = await _classService.RemoveStudentAsync(studentId, classId);
            if (result.MessageCode == ResponseCode.Forbidden) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(result);
        }
        [HttpPost]
        [Route("create")]
        [SessionAuthorize("F0101")]
        public async Task<IActionResult> Create(CreateClassDto newClass)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.CreateAsync(newClass);
            return Ok(apiResultModel);
        }

       
        [HttpPut]
        [Route("update/{classId}")]
        [SessionAuthorize("F0113")]
        public async Task<IActionResult> Update(UpdateClassDto updateClass, int classId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.UpdateAsync(updateClass, classId);
            if (apiResultModel.MessageCode == ResponseCode.Forbidden) return Unauthorized("Forbidden: You do not have permission to perform this action.");
            return Ok(apiResultModel);
        }


       
        [HttpDelete]
        [Route("delete")]
        [SessionAuthorize("F0114")]
        public async Task<IActionResult> Delete(int classId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            var curClass = await _classService.GetByIdAsync(classId);
            var authResult = await _authorizationService.AuthorizeAsync(User, curClass, new ResourceRequirement(ResourceAction.ViewDetail));
            if (!authResult.Succeeded)
            {
                return Unauthorized("Forbidden: You do not have permission to perform this action.");
            }
            var success = await _classService.DeleteAsync(classId);
            apiResultModel.Status = success;
            apiResultModel.Data = success;
            if (success)
            {
                apiResultModel.MessageCode = ResponseCode.NotFound;
            }
            else
            {
                apiResultModel.MessageCode = ResponseCode.Success;
            }
            return Ok(apiResultModel);
        }
    }
}
