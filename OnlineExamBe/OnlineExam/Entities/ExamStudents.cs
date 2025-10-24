using System;
using System.Collections.Generic;

namespace OnlineExam.Entities;

public partial class ExamStudents
{
    public int ExamId { get; set; }

    public int StudentId { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public float? Points { get; set; }

    public string Status { get; set; } = null!;

    public virtual Exams Exam { get; set; } = null!;

    public virtual Users Student { get; set; } = null!;
}
