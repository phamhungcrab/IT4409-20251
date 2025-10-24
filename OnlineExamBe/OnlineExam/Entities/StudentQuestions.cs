using System;
using System.Collections.Generic;

namespace OnlineExam.Entities;

public partial class StudentQuestions
{
    public int StudentId { get; set; }

    public int QuestionExamId { get; set; }

    public string Answer { get; set; } = null!;

    public float? Result { get; set; }

    public virtual QuestionExams QuestionExam { get; set; } = null!;

    public virtual Users Student { get; set; } = null!;
}
