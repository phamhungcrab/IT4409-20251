using System;
using System.Collections.Generic;

namespace OnlineExam.Entities;

public partial class QuestionExams
{
    public int Id { get; set; }

    public int ExamId { get; set; }

    public int QuestionId { get; set; }

    public string CorrectAnswer { get; set; } = null!;

    public virtual Exams Exam { get; set; } = null!;

    public virtual Questions Question { get; set; } = null!;

    public virtual ICollection<StudentQuestions> StudentQuestions { get; set; } = new List<StudentQuestions>();
}
