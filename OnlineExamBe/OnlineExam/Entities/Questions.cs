using System;
using System.Collections.Generic;

namespace OnlineExam.Entities;

public partial class Questions
{
    public int Id { get; set; }

    public string Type { get; set; } = null!;

    public string Content { get; set; } = null!;

    public float Point { get; set; }

    public string Answer { get; set; } = null!;

    public int SubjectId { get; set; }

    public virtual ICollection<QuestionExams> QuestionExams { get; set; } = new List<QuestionExams>();

    public virtual Subjects Subject { get; set; } = null!;
}
