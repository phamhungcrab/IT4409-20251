using System;
using System.Collections.Generic;

namespace OnlineExam.Entities;

public partial class Subjects
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string SubjectCode { get; set; } = null!;

    public virtual ICollection<Classes> Classes { get; set; } = new List<Classes>();

    public virtual ICollection<Questions> Questions { get; set; } = new List<Questions>();
}
