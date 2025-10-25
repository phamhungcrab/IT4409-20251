using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="Score"/> entity.  Score records
    /// the aggregated grades for an exam attempt including
    /// objective (auto‑graded) and subjective (manual) components.
    /// A one‑to‑one relationship with <see cref="ExamStudent"/> is
    /// enforced via the foreign key.
    /// </summary>
    public class ScoreConfiguration : IEntityTypeConfiguration<Score>
    {
        public void Configure(EntityTypeBuilder<Score> builder)
        {
            builder.ToTable("Scores");
            builder.HasKey(s => s.Id);
            builder.Property(s => s.ObjectiveScore)
                .HasColumnType("decimal(10,2)");
            builder.Property(s => s.SubjectiveScore)
                .HasColumnType("decimal(10,2)");
            builder.Property(s => s.TotalScore)
                .HasColumnType("decimal(10,2)");
            builder.Property(s => s.IsFinal)
                .IsRequired();
            builder.Property(s => s.CreatedAt)
                .HasColumnType("datetime2");
            builder.Property(s => s.UpdatedAt)
                .HasColumnType("datetime2");
            // One-to-one with ExamStudent
            builder.HasOne(s => s.ExamStudent)
                .WithOne(es => es.Score)
                .HasForeignKey<Score>(s => s.ExamStudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}