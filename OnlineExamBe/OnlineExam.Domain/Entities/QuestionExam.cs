using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class QuestionExam
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public int QuestionId { get; set; }
        public required string CorrectAnswer { get; set; }

        public required Exam Exam { get; set; }
        public Question Question { get; set; }
        public ICollection<StudentQuestion> StudentQuestions { get; set; }
    }
}
