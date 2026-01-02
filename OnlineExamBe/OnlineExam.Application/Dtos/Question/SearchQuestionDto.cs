using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.Question
{
    public class SearchQuestionDto : SearchBaseDto
    {
        public string? Content { get; set; } = String.Empty;
        public float? PointFrom { get; set; }
        public float? PointTo { get; set; }
        public QuestionDifficulty? DifficultyFrom { get; set; }
        public QuestionDifficulty? DifficultyTo { get; set; }
        public QuestionType? Type { get; set; }
        public int? SubjectId { get; set; }
        public int? Chapter { get; set; }
    }

   

}
