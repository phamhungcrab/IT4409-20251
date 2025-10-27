using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Wise.Domain.Enums;

namespace Wise.Domain.Entities
{
    public class Question
    {
        public int Id { get; set; }

        public int LessonId { get; set; }
        public string Text { get; set; } = "";
        public QuestionType Type { get; set; }

        // Navigation
        public Lesson? Lesson { get; set; }
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }
}
