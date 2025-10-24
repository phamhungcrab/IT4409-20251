using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class StudentQuestion
    {
        public int StudentId { get; set; }
        public int QuestionExamId { get; set; }
        public required string Answer { get; set; }
        public float? Result { get; set; }

        public User Student { get; set; }
        public QuestionExam QuestionExam { get; set; }
    }

}
