using OnlineExam.Domain.Entities;

public class StudentQuestion
{
    // Composite key (ExamId + StudentId + QuestionId)
    public int ExamId { get; set; }
    public int StudentId { get; set; }
    public int QuestionId { get; set; }

    // Student answer
    public string Answer { get; set; } = "";
    public float? Result { get; set; }
    public int? TimeSpent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public float QuestionPoint { get; set; }

    // Navigation properties
    public User? Student { get; set; }
    public QuestionExam? QuestionExam { get; set; }
}
