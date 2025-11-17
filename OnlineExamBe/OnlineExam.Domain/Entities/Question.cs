using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class Question
    {
        public int Id { get; set; }
        public QuestionType Type { get; set; }
        public QuestionDifficulty Difficulty { get; set; } = QuestionDifficulty.Easy;
        public required string Content { get; set; }
        public float Point { get; set; }
        public required string Answer { get; set; }
        public int SubjectId { get; set; }

        public required Subject Subject { get; set; }
        public ICollection<QuestionExam> QuestionExams { get; set; } = new List<QuestionExam>();
    }
}
