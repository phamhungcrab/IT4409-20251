using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="StudentQuestion"/> entity.  This
    /// entity records the presentation of a question snapshot to a
    /// particular student during an exam session.  It stores the
    /// per‑student order, selected options or essay answer, and
    /// optionally a score.  A unique constraint on
    /// (ExamStudentId, QuestionExamId) ensures that each question
    /// appears at most once per student.
    /// </summary>
    public class StudentQuestionConfiguration : IEntityTypeConfiguration<StudentQuestion>
    {
        public void Configure(EntityTypeBuilder<StudentQuestion> builder)
        {
            builder.ToTable("StudentQuestions");
            builder.HasKey(sq => sq.Id);
            builder.Property(sq => sq.Order)
                .IsRequired();
            builder.Property(sq => sq.SelectedOptionIds)
                .HasMaxLength(1000);
            builder.Property(sq => sq.EssayAnswer)
                .HasMaxLength(4000);
            builder.Property(sq => sq.Score)
                .HasColumnType("decimal(10,2)");
            // Unique per student per question snapshot
            builder.HasIndex(sq => new { sq.ExamStudentId, sq.QuestionExamId })
                .IsUnique();
            // Relationships
            builder.HasOne(sq => sq.ExamStudent)
                .WithMany(es => es.StudentQuestions)
                .HasForeignKey(sq => sq.ExamStudentId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(sq => sq.QuestionExam)
                .WithMany(qe => qe.StudentQuestions)
                .HasForeignKey(sq => sq.QuestionExamId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(sq => sq.Answers)
                .WithOne(a => a.StudentQuestion)
                .HasForeignKey(a => a.StudentQuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}