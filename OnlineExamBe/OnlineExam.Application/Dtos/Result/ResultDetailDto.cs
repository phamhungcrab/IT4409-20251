using OnlineExam.Domain.Enums;

namespace OnlineExam.Application.Dtos.Result
{
    public class QuestionResultDto
    {
        public int QuestionId { get; set; }
        public string QuestionContent { get; set; } = string.Empty;
        public string StudentAnswer { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public float Point { get; set; }
        public float Earned { get; set; }
    }

    public class ResultDetailDto
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; } = string.Empty;
        public ExamStatus Status { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public float TotalScore { get; set; }
        public float MaxScore { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectCount { get; set; }
        public double Percentage { get; set; }
        public IEnumerable<QuestionResultDto> Questions { get; set; } = Enumerable.Empty<QuestionResultDto>();
    }
}
