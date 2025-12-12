using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.Class;
using OnlineExam.Application.Dtos.RequestDtos.User;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Attributes;
using OnlineExam.Domain.Enums;
using System.Text.Json;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CLassController : Controller
    {
        private readonly IClassService _classService;
        public CLassController(IClassService classService) 
        {
            _classService = classService;

        }
        [HttpGet]
        [Route("get-all")]
        [SessionAuthorize(UserRole.ADMIN)]
        public async Task<IActionResult> GetAll()
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel.Status = true;
            apiResultModel.Data = await _classService.GetAllAsync("Teacher", "Subject", "StudentClasses", "Exams");
            return Ok(apiResultModel);
        }
        [HttpGet]
        [Route("get-by-teacher-and-subject")]
        [SessionAuthorize(UserRole.TEACHER,UserRole.ADMIN)]
        public async Task<IActionResult> GetByTeacherAndSubject(int? teacherId = null, int? subjectId = null )
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.GetByTeacherAndSubject(teacherId, subjectId);
            return Ok(apiResultModel);
        }


        [HttpGet]
        [Route("get-students")]
        
        public async Task<IActionResult> GetStudents(int classId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.GetStudents(classId);
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
        //[Authorize(Roles ="ADMIN")]
        public async Task<IActionResult> AddUsers(IFormFile file,int classId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            string json = await reader.ReadToEndAsync();

            var listUser = JsonSerializer.Deserialize<AddStudentDto[]>(json);

            if (listUser == null)
                return BadRequest("Invalid JSON file");

            var result = await _classService.AddStudentsAsync(listUser, classId);

            return Ok(result);
        }

        [HttpPost]
        [Route("create")]
        //[Authorize(Roles ="ADMIN")]
        public async Task<IActionResult> Create(CreateClassDto newClass)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.CreateAsync(newClass);
            return Ok(apiResultModel);
        }

       
        [HttpPut]
        [Route("update/{classId}")]

        public async Task<IActionResult> Update(UpdateClassDto updateClass, int classId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
            apiResultModel = await _classService.UpdateAsync(updateClass, classId);
            return Ok(apiResultModel);
        }


       
        [HttpDelete]
        [Route("delete")]

        public async Task<IActionResult> Delete(int classId)
        {
            ResultApiModel apiResultModel = new ResultApiModel();
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
