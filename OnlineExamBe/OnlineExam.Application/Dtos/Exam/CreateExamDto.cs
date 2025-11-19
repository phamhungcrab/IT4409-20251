using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.Exam
{
    public class CreateExamDto
    {
        public required string Name { get; set; }
        public int ClassId { get; set; }
        public int BlueprintId { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
