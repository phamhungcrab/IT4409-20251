using System;
using System.Collections.Generic;

namespace OnlineExam.Entities;

public partial class Exams
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public virtual ICollection<ExamStudents> ExamStudents { get; set; } = new List<ExamStudents>();

    public virtual ICollection<QuestionExams> QuestionExams { get; set; } = new List<QuestionExams>();
}
