using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="ExamStudent"/> entity.  This
    /// bridging entity associates a student with an exam and
    /// records the status, timing and final score for their
    /// attempt.  A unique constraint on (ExamId, StudentId)
    /// ensures that a student cannot be assigned the same exam
    /// more than once.  Additional metadata such as objective and
    /// subjective scores live on the related <see cref="Score"/>.
    /// </summary>
    public class ExamStudentConfiguration : IEntityTypeConfiguration<ExamStudent>
    {
        public void Configure(EntityTypeBuilder<ExamStudent> builder)
        {
            builder.ToTable("ExamStudents");
            builder.HasKey(es => es.Id);
            builder.Property(es => es.Status)
                .IsRequired()
                .HasMaxLength(30);
            builder.Property(es => es.StartTime)
                .HasColumnType("datetime2");
            builder.Property(es => es.EndTime)
                .HasColumnType("datetime2");
            builder.Property(es => es.SubmittedAt)
                .HasColumnType("datetime2");
            builder.Property(es => es.TotalScore)
                .HasColumnType("decimal(10,2)");
            // Unique constraint to prevent duplicate assignments
            builder.HasIndex(es => new { es.ExamId, es.StudentId })
                .IsUnique();
            // Relationships
            builder.HasOne(es => es.Exam)
                .WithMany(e => e.ExamStudents)
                .HasForeignKey(es => es.ExamId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(es => es.Student)
                .WithMany(u => u.ExamStudents)
                .HasForeignKey(es => es.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(es => es.StudentQuestions)
                .WithOne(sq => sq.ExamStudent)
                .HasForeignKey(sq => sq.ExamStudentId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(es => es.Score)
                .WithOne(sc => sc.ExamStudent)
                .HasForeignKey<Score>(sc => sc.ExamStudentId)
                // When an ExamStudent is deleted, cascade to the score
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}