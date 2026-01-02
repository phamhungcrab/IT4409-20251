using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class ExamStudentStatusDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = "";
        public string MSSV { get; set; } = "";

        public ExamStatus? Status { get; set; }   
        public float? Score { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }

    public class ExamStudentsStatusResponse
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; } = "";
        public List<ExamStudentStatusDto> Students { get; set; } = new();
    }
}
