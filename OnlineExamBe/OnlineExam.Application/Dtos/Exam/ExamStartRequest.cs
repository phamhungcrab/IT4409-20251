using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.Exam
{
    public class ExamStartRequest
    {
        public int ExamId { get; set; }
        public int StudentId { get; set; }
        public int ClassId { get; set; }
        public int BlueprintId { get; set; }
        public int DurationMinutes { get; set; }
    }

}
