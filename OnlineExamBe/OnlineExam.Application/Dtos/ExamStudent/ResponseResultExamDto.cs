using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamStudent
{
    public class ResponseResultExamDto
    {
        public int ExamId { get; set; }
        public int StudentId { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public float? Points { get; set; }
        public ExamStatus Status { get; set; }
    }
}
