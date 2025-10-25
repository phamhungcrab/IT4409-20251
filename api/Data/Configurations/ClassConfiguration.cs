using System.Collections.Generic;
using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Fluent configuration for the <see cref="Class"/> entity.
    /// Configures property lengths and many-to-many relationships
    /// with students and exams.
    /// </summary>
    public class ClassConfiguration : IEntityTypeConfiguration<Class>
    {
        public void Configure(EntityTypeBuilder<Class> builder)
        {
            builder.ToTable("Classes");
            builder.HasKey(c => c.Id);
            builder.Property(c => c.ClassCode)
                .HasMaxLength(50);
            builder.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(100);
            // Relationships
            builder.HasOne(c => c.Subject)
                .WithMany(s => s.Classes)
                .HasForeignKey(c => c.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(c => c.Teacher)
                .WithMany(u => u.ClassesTeaching)
                .HasForeignKey(c => c.TeacherId)
                .OnDelete(DeleteBehavior.SetNull);
            // Many-to-many between Class and User (students)
            builder.HasMany(c => c.Students)
                .WithMany() // User does not define a navigation property
                .UsingEntity<Dictionary<string, object>>("ClassStudent",
                    j => j.HasOne<User>().WithMany().HasForeignKey("StudentId").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<Class>().WithMany().HasForeignKey("ClassId").OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.ToTable("ClassStudents");
                        j.HasKey("ClassId", "StudentId");
                    });
            // Many-to-many between Class and Exam
            builder.HasMany(c => c.Exams)
                .WithMany(e => e.Classes)
                .UsingEntity<Dictionary<string, object>>("ExamClass",
                    j => j.HasOne<Exam>().WithMany().HasForeignKey("ExamId").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<Class>().WithMany().HasForeignKey("ClassId").OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.ToTable("ExamClasses");
                        j.HasKey("ExamId", "ClassId");
                    });
            builder.HasMany(c => c.Announcements)
                .WithOne(a => a.Class)
                .HasForeignKey(a => a.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}