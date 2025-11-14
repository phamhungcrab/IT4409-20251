using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class Exam
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public ICollection<QuestionExam> QuestionExams { get; set; }
        public ICollection<ExamStudent> ExamStudents { get; set; }
    }
}
