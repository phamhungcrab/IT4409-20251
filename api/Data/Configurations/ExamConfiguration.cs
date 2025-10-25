using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="Exam"/> entity.
    /// </summary>
    public class ExamConfiguration : IEntityTypeConfiguration<Exam>
    {
        public void Configure(EntityTypeBuilder<Exam> builder)
        {
            builder.ToTable("Exams");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            builder.Property(e => e.Description)
                .HasMaxLength(1000);
            builder.Property(e => e.StartTime)
                .HasColumnType("datetime2");
            builder.Property(e => e.EndTime)
                .HasColumnType("datetime2");
            builder.Property(e => e.IsPublished)
                .IsRequired();
            builder.Property(e => e.PublishedAt)
                .HasColumnType("datetime2");
            // Relationship to author
            builder.HasOne(e => e.CreatedBy)
                .WithMany(u => u.AuthoredExams)
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
            // Snapshot questions
            builder.HasMany(e => e.QuestionExams)
                .WithOne(qe => qe.Exam)
                .HasForeignKey(qe => qe.ExamId)
                .OnDelete(DeleteBehavior.Cascade);
            // Student assignments
            builder.HasMany(e => e.ExamStudents)
                .WithOne(es => es.Exam)
                .HasForeignKey(es => es.ExamId)
                .OnDelete(DeleteBehavior.Cascade);
            // Many-to-many with classes configured in ClassConfiguration
            // Announcements
            builder.HasMany(e => e.Announcements)
                .WithOne(a => a.Exam)
                .HasForeignKey(a => a.ExamId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}