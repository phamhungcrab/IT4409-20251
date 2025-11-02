using System.Collections.Generic;
using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    public class ClassConfiguration : IEntityTypeConfiguration<Class>
    {
        public void Configure(EntityTypeBuilder<Class> builder)
        {
            builder.ToTable("Classes");
            builder.HasKey(c => c.Id);

            builder.Property(c => c.ClassCode).HasMaxLength(50);
            builder.Property(c => c.Name).IsRequired().HasMaxLength(100);

            // Subject → Classes (1-n)
            builder.HasOne(c => c.Subject)
                   .WithMany(s => s.Classes)
                   .HasForeignKey(c => c.SubjectId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Teacher(User) → ClassesTeaching (1-n) — khớp với [InverseProperty]
            builder.HasOne(c => c.Teacher)
                   .WithMany(u => u.ClassesTeaching)
                   .HasForeignKey(c => c.TeacherId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Students(User) ↔ EnrolledClasses (n-n) — khớp với [InverseProperty]
            builder.HasMany(c => c.Students)
                   .WithMany(u => u.EnrolledClasses)
                   .UsingEntity<Dictionary<string, object>>(
                        "ClassStudents",
                        j => j.HasOne<User>().WithMany().HasForeignKey("StudentId").OnDelete(DeleteBehavior.Cascade),
                        j => j.HasOne<Class>().WithMany().HasForeignKey("ClassId").OnDelete(DeleteBehavior.Cascade),
                        j =>
                        {
                            j.ToTable("ClassStudents");
                            j.HasKey("ClassId", "StudentId");
                        });

            // Class ↔ Exam (n-n)
            builder.HasMany(c => c.Exams)
                   .WithMany(e => e.Classes)
                   .UsingEntity<Dictionary<string, object>>(
                        "ExamClasses",
                        j => j.HasOne<Exam>().WithMany().HasForeignKey("ExamId").OnDelete(DeleteBehavior.Cascade),
                        j => j.HasOne<Class>().WithMany().HasForeignKey("ClassId").OnDelete(DeleteBehavior.Cascade),
                        j =>
                        {
                            j.ToTable("ExamClasses");
                            j.HasKey("ExamId", "ClassId");
                        });

            // Class → Announcements (1-n)
            builder.HasMany(c => c.Announcements)
                   .WithOne(a => a.Class)
                   .HasForeignKey(a => a.ClassId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
