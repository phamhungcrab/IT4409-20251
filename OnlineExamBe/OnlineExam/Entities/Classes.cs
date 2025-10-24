using System;
using System.Collections.Generic;

namespace OnlineExam.Entities;

public partial class Classes
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int TeacherId { get; set; }

    public int SubjectId { get; set; }

    public virtual Subjects Subject { get; set; } = null!;

    public virtual Users Teacher { get; set; } = null!;

    public virtual ICollection<Users> Student { get; set; } = new List<Users>();
}
