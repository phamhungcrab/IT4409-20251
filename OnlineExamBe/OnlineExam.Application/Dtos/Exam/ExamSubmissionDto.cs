using System.Collections.Generic;

namespace OnlineExam.Application.Dtos.Exam
{
    public class ExamSubmissionDto
    {
        public int ExamId { get; set; }
        public int StudentId { get; set; }
        public List<StudentAnswerDto> Answers { get; set; } = new List<StudentAnswerDto>();
    }

    public class StudentAnswerDto
    {
        public int QuestionId { get; set; }
        public string Answer { get; set; } = string.Empty;
    }
}
