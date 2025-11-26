using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using Microsoft.Extensions.Options;
using OnlineExam.Application.Dtos.Question;
using OnlineExam.Application.Dtos.RequestDtos.User;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services;
using OnlineExam.Domain.Entities;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService _service;
        public QuestionController(IQuestionService service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        
        [HttpPost("import-question")]
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

            var listQuestion = JsonSerializer.Deserialize<CreateQuestionDto[]>(json, options);

            if (listQuestion == null)
                return BadRequest("Invalid JSON file");

            var result = await _service.AddListQuestion(listQuestion);

            if (result == true) return Ok();
            else return BadRequest();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _service.GetByIdAsync(id);
            return entity == null ? NotFound() : Ok(entity);
        }

        [HttpPost("create-question")]
        public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto)
        {
            if (dto == null) return BadRequest("Lỗi question trống");
            var question = new Question
            {
                Content = dto.Content,
                Answer = dto.Answer,
                Point = dto.Point,
                Difficulty = dto.Difficulty,
                Type = dto.Type,
                SubjectId = dto.SubjectId
            };

            await _service.CreateAsync(question);
            return Ok();
        }

        [HttpPut("update-question")]
        public async Task<IActionResult> Update([FromBody] UpdateQuestionDto dto)
        {
            var entity = await _service.GetByIdAsync(dto.Id);
            if (entity == null) return NotFound("Question not found");

            entity.Type = dto.Type;
            entity.Difficulty = dto.Difficulty;
            entity.Content = dto.Content;
            entity.Point = dto.Point;
            entity.Answer = dto.Answer;
            entity.SubjectId = dto.SubjectId;

            var ok = await _service.UpdateAsync(entity);
            return ok ? Ok("Updated") : BadRequest("Update failed");
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id);
            return ok ? Ok() : BadRequest("Not found");
        }
    }
}
