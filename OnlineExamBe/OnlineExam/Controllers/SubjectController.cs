using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Dtos.Question;
using OnlineExam.Application.Dtos.Subject;
using OnlineExam.Application.Interfaces;
using OnlineExam.Domain.Entities;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _service;
        public SubjectController(ISubjectService service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllAsync();
                var dto = result.Select(s => new ResponseSubjectDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    SubjectCode = s.SubjectCode,
                    TotalChapters = s.TotalChapters
                }).ToList();

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                if (result == null) return NotFound();
                else
                {
                    var dto = new ResponseSubjectDto
                    {
                        Id = result.Id,
                        Name = result.Name,
                        SubjectCode = result.SubjectCode,
                        TotalChapters = result.TotalChapters
                    };
                    return Ok(dto);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateSubjectDto dto)
        {
            try
            {
                if (dto == null) return BadRequest("Thiếu dữ liệu");
                var exis = await _service.GetByCodeAsync(dto.SubjectCode);
                if (exis != null) return BadRequest("Môn học đã tồn tại (SubjectCode)");

                var subject = new Subject
                {
                    Name = dto.Name,
                    SubjectCode = dto.SubjectCode,
                    TotalChapters = dto.TotalChapters
                };

                await _service.CreateAsync(subject);

                return Ok(new
                {
                    message = "Created successfully",
                    id = subject.Id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("get-with-{code}")]
        public async Task<IActionResult> GetBySubjectCode(string code)
        {
            var result = await _service.GetByCodeAsync(code);
            if (result != null)
            {
                var dto = new ResponseSubjectDto
                {
                    Id = result.Id,
                    Name = result.Name,
                    SubjectCode = result.SubjectCode,
                    TotalChapters = result.TotalChapters
                };
                return Ok(dto);
            }
            else return NotFound("Không tìm thấy");
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSubjectDto dto)
        {
            try
            {
                var subject = await _service.GetByIdAsync(id);
                if (subject == null)
                    return NotFound("Subject not found");

                var checkCode = await _service.GetByCodeAsync(dto.SubjectCode);
                if (checkCode == null || checkCode.Id == id)
                {
                    subject.Name = dto.Name;
                    subject.SubjectCode = dto.SubjectCode;
                    subject.TotalChapters = dto.TotalChapters;

                    await _service.UpdateAsync(subject);

                    return Ok("Updated successfully");
                }
                else
                {
                    return BadRequest("Đã tồn tại môn học bạn muốn cập nhật");
                }
                
            }
            catch (Exception ex)    
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.DeleteAsync(id);
                if (result == false) return NotFound();

                else return Ok("Deleted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("import-subject")]
        public async Task<IActionResult> ImportList(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            var options = new JsonSerializerOptions
            {
                Converters = { new JsonStringEnumConverter() }
            };

            options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            string json = await reader.ReadToEndAsync();

            var listQuestion = JsonSerializer.Deserialize<CreateSubjectDto[]>(json, options);

            if (listQuestion == null)
                return BadRequest("Invalid JSON file");

            var result = await _service.AddListSubject(listQuestion);

            if (result == true) return Ok();
            else return BadRequest();
        }
    }
}
