using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Fluent configuration for the <see cref="User"/> entity.  Sets
    /// property constraints, indexes and relationships to other
    /// entities.  Ensures emails are unique and configures enum
    /// conversion for the Role property.
    /// </summary>
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(255);
            builder.HasIndex(u => u.Email)
                .IsUnique();
            builder.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(255);
            builder.Property(u => u.FullName)
                .HasMaxLength(100);
            // Store Role enum as string for readability
            builder.Property(u => u.Role)
                .HasConversion<string>()
                .IsRequired();
            builder.Property(u => u.CreatedAt)
                .HasColumnType("datetime2");
            builder.Property(u => u.UpdatedAt)
                .HasColumnType("datetime2");
            // Relationships
            builder.HasMany(u => u.AuthoredExams)
                .WithOne(e => e.CreatedBy)
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(u => u.ClassesTeaching)
                .WithOne(c => c.Teacher)
                .HasForeignKey(c => c.TeacherId)
                .OnDelete(DeleteBehavior.SetNull);
            builder.HasMany(u => u.ExamStudents)
                .WithOne(es => es.Student)
                .HasForeignKey(es => es.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(u => u.Announcements)
                .WithOne(a => a.CreatedBy)
                .HasForeignKey(a => a.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(u => u.AuditEvents)
                .WithOne(ae => ae.Actor)
                .HasForeignKey(ae => ae.ActorId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}