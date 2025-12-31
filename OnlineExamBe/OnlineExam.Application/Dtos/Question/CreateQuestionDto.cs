using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.Question
{
    public class CreateQuestionDto
    {
        public string Content { get; set; } = String.Empty;
        public string Answer { get; set; } = String.Empty;
        public float Point { get; set; }
        public QuestionDifficulty Difficulty { get; set; } = QuestionDifficulty.Easy;
        public QuestionType Type { get; set; }
        public int SubjectId { get; set; }
        public int Chapter { get; set; } = 1;
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = String.Empty;
        public string Answer { get; set; } = String.Empty;
        public float Point { get; set; }
        public QuestionDifficulty Difficulty { get; set; }
        public QuestionType Type { get; set; }
        public int SubjectId { get; set; }
        public int Chapter { get; set; } = 1;
    }

    public class UpdateQuestionDto
    {
        public int Id { get; set; }
        public QuestionType Type { get; set; }
        public QuestionDifficulty Difficulty { get; set; }
        public string Content { get; set; } = String.Empty;
        public float Point { get; set; }
        public string Answer { get; set; } = String.Empty;
        public int SubjectId { get; set; }
        public int Chapter { get; set; } = 1;
    }

}
