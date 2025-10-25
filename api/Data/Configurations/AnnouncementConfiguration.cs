using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="Announcement"/> entity.  An
    /// announcement may target an exam, a class or be global.  It
    /// records the message, optional severity, creator and
    /// timestamp.  Relationships back to exam, class and user are
    /// configured in the respective entities.
    /// </summary>
    public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
    {
        public void Configure(EntityTypeBuilder<Announcement> builder)
        {
            builder.ToTable("Announcements");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Message)
                .IsRequired()
                .HasMaxLength(2000);
            builder.Property(a => a.Severity)
                .HasMaxLength(20);
            builder.Property(a => a.CreatedAt)
                .HasColumnType("datetime2");
            // Relationships configured on other entities
            builder.HasOne(a => a.CreatedBy)
                .WithMany(u => u.Announcements)
                .HasForeignKey(a => a.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(a => a.Exam)
                .WithMany(e => e.Announcements)
                .HasForeignKey(a => a.ExamId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(a => a.Class)
                .WithMany(c => c.Announcements)
                .HasForeignKey(a => a.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}