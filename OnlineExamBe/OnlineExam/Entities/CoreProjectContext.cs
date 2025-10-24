using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace OnlineExam.Entities;

public partial class CoreProjectContext : DbContext
{
    public CoreProjectContext()
    {
    }

    public CoreProjectContext(DbContextOptions<CoreProjectContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Classes> Classes { get; set; }

    public virtual DbSet<ExamStudents> ExamStudents { get; set; }

    public virtual DbSet<Exams> Exams { get; set; }

    public virtual DbSet<QuestionExams> QuestionExams { get; set; }

    public virtual DbSet<Questions> Questions { get; set; }

    public virtual DbSet<StudentQuestions> StudentQuestions { get; set; }

    public virtual DbSet<Subjects> Subjects { get; set; }

    public virtual DbSet<Users> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=34.92.183.10;Database=ExamSystemDB;User Id=sqlserver;Password=121233;TrustServerCertificate=True;MultipleActiveResultSets=true");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Classes>(entity =>
        {
            entity.HasIndex(e => e.SubjectId, "IX_Classes_SubjectId");

            entity.HasIndex(e => e.TeacherId, "IX_Classes_TeacherId");

            entity.HasOne(d => d.Subject).WithMany(p => p.Classes).HasForeignKey(d => d.SubjectId);

            entity.HasOne(d => d.Teacher).WithMany(p => p.Classes)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<ExamStudents>(entity =>
        {
            entity.HasKey(e => new { e.ExamId, e.StudentId });

            entity.HasIndex(e => e.StudentId, "IX_ExamStudents_StudentId");

            entity.HasOne(d => d.Exam).WithMany(p => p.ExamStudents).HasForeignKey(d => d.ExamId);

            entity.HasOne(d => d.Student).WithMany(p => p.ExamStudents).HasForeignKey(d => d.StudentId);
        });

        modelBuilder.Entity<QuestionExams>(entity =>
        {
            entity.HasIndex(e => e.ExamId, "IX_QuestionExams_ExamId");

            entity.HasIndex(e => e.QuestionId, "IX_QuestionExams_QuestionId");

            entity.HasOne(d => d.Exam).WithMany(p => p.QuestionExams).HasForeignKey(d => d.ExamId);

            entity.HasOne(d => d.Question).WithMany(p => p.QuestionExams).HasForeignKey(d => d.QuestionId);
        });

        modelBuilder.Entity<Questions>(entity =>
        {
            entity.HasIndex(e => e.SubjectId, "IX_Questions_SubjectId");

            entity.HasOne(d => d.Subject).WithMany(p => p.Questions).HasForeignKey(d => d.SubjectId);
        });

        modelBuilder.Entity<StudentQuestions>(entity =>
        {
            entity.HasKey(e => new { e.StudentId, e.QuestionExamId });

            entity.HasIndex(e => e.QuestionExamId, "IX_StudentQuestions_QuestionExamId");

            entity.HasOne(d => d.QuestionExam).WithMany(p => p.StudentQuestions).HasForeignKey(d => d.QuestionExamId);

            entity.HasOne(d => d.Student).WithMany(p => p.StudentQuestions).HasForeignKey(d => d.StudentId);
        });

        modelBuilder.Entity<Subjects>(entity =>
        {
            entity.HasIndex(e => e.SubjectCode, "IX_Subjects_SubjectCode").IsUnique();
        });

        modelBuilder.Entity<Users>(entity =>
        {
            entity.HasIndex(e => e.Email, "IX_Users_Email").IsUnique();

            entity.HasMany(d => d.Class).WithMany(p => p.Student)
                .UsingEntity<Dictionary<string, object>>(
                    "StudentClasses",
                    r => r.HasOne<Classes>().WithMany().HasForeignKey("ClassId"),
                    l => l.HasOne<Users>().WithMany().HasForeignKey("StudentId"),
                    j =>
                    {
                        j.HasKey("StudentId", "ClassId");
                        j.HasIndex(new[] { "ClassId" }, "IX_StudentClasses_ClassId");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
