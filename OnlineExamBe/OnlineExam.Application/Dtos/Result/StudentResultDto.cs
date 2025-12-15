using OnlineExam.Domain.Enums;

namespace OnlineExam.Application.Dtos.Result
{
    public class StudentResultDto
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; } = string.Empty;
        public float Score { get; set; }
        public ExamStatus Status { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }
}
