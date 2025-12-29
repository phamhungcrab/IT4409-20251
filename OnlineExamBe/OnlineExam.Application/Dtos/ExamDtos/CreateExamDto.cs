using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class CreateExamForStudentDto
    {
        public int ExamId { get; set; }
        public int StudentId { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public class CreateExamForTeacherOrAdmin
    {
        public required string Name { get; set; }
        public int ClassId { get; set; }
        public int BlueprintId { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
