using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class GetListExamForStudentDto
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; } = "";
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }

        public ExamStatus? Status { get; set; } = null;
    }
}
