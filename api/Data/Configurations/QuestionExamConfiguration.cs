using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="QuestionExam"/> entity.  A
    /// QuestionExam represents a frozen copy of a question at the
    /// moment an exam is published.  It stores the question text,
    /// options and correct answers in JSON form so that later edits
    /// to the source question do not affect existing exams.  It
    /// also links back to the original question and the exam it
    /// belongs to.
    /// </summary>
    public class QuestionExamConfiguration : IEntityTypeConfiguration<QuestionExam>
    {
        public void Configure(EntityTypeBuilder<QuestionExam> builder)
        {
            builder.ToTable("QuestionExams");
            builder.HasKey(qe => qe.Id);
            builder.Property(qe => qe.QuestionText)
                .IsRequired()
                .HasMaxLength(2000);
            builder.Property(qe => qe.OptionsJson)
                .IsRequired();
            // CorrectAnswersJson may be null for essay questions
            builder.Property(qe => qe.CorrectAnswersJson);
            builder.Property(qe => qe.Order)
                .IsRequired();
            // Relationships
            builder.HasOne(qe => qe.Exam)
                .WithMany(e => e.QuestionExams)
                .HasForeignKey(qe => qe.ExamId)
                // When an exam is deleted, cascade to snapshots to keep
                // referential integrity.  Deleting exams should be rare
                // in production; prefer soft deletes for auditability.
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(qe => qe.Question)
                .WithMany(q => q.QuestionExams)
                .HasForeignKey(qe => qe.QuestionId)
                // Restrict deletes of questions that are referenced by
                // published exams.  This prevents accidental loss of
                // historical data.
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(qe => qe.StudentQuestions)
                .WithOne(sq => sq.QuestionExam)
                .HasForeignKey(sq => sq.QuestionExamId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}