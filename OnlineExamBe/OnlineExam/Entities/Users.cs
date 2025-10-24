using System;
using System.Collections.Generic;

namespace OnlineExam.Entities;

public partial class Users
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public DateTime DateOfBirth { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public virtual ICollection<Classes> Classes { get; set; } = new List<Classes>();

    public virtual ICollection<ExamStudents> ExamStudents { get; set; } = new List<ExamStudents>();

    public virtual ICollection<StudentQuestions> StudentQuestions { get; set; } = new List<StudentQuestions>();

    public virtual ICollection<Classes> Class { get; set; } = new List<Classes>();
}
