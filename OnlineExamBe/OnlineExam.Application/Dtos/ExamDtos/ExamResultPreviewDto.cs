using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class ExamResultPreviewDto
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; } = string.Empty;

        public int StudentId { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public double TotalPoint { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectCount { get; set; }

        public List<ExamQuestionResultDto> Details { get; set; } = new();
    }

    public class ExamQuestionResultDto
    {
        public int QuestionId { get; set; }
        public int Order { get; set; }
        public string Content { get; set; } = "";
        public string StudentAnswer { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public List<string> CleanAnswer { get; set; } = new();
        public bool IsCorrect { get; set; }
        public float QuestionPoint { get; set; }
        public double StudentPoint { get; set; }
    }

}
