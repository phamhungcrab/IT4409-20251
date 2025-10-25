using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="Answer"/> entity.  Answers store
    /// serialized answer data for a student’s response to a
    /// question during an exam.  Multiple answers may exist for a
    /// single student question due to autosave, but only the
    /// latest prior to submission should be used for grading.
    /// </summary>
    public class AnswerConfiguration : IEntityTypeConfiguration<Answer>
    {
        public void Configure(EntityTypeBuilder<Answer> builder)
        {
            builder.ToTable("Answers");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.CreatedAt)
                .HasColumnType("datetime2");
            builder.Property(a => a.AnswerData)
                .IsRequired();
            builder.HasOne(a => a.StudentQuestion)
                .WithMany(sq => sq.Answers)
                .HasForeignKey(a => a.StudentQuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}