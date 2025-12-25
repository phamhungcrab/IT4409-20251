using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class ExamGenerateResultDto
    {
        public int ExamId { get; set; }
        public string Name { get; set; } = "";
        public int TotalQuestions { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public int ClassId { get; set; }
        public int? BlueprintId { get; set; }

        public List<GeneratedQuestionDto> Questions { get; set; } = new();
    }

    public class GeneratedQuestionDto
    {
        public int Id { get; set; }
        public QuestionType Type { get; set; }
        public QuestionDifficulty Difficulty { get; set; } = QuestionDifficulty.Easy;
        public int Order { get; set; } // Thứ tứ sau khi gen đề
        public required string Content { get; set; }
        public string ImageUrl { get; set; } = String.Empty;
        public float Point { get; set; }
        public int Chapter { get; set; }
        public required List<string> CleanAnswer { get; set; }
    }
}
