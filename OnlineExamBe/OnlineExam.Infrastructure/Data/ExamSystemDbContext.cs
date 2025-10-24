using Microsoft.EntityFrameworkCore;
using OnlineExam.Domain.Entities;

namespace OnlineExam.Infrastructure.Data
{
    public class ExamSystemDbContext : DbContext
    {
        public ExamSystemDbContext(DbContextOptions<ExamSystemDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<StudentClass> StudentClasses { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionExam> QuestionExams { get; set; }
        public DbSet<ExamStudent> ExamStudents { get; set; }
        public DbSet<StudentQuestion> StudentQuestions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Role).HasConversion<string>();
            });

            // Subject
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.SubjectCode).IsUnique();
            });

            // Class
            modelBuilder.Entity<Class>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Teacher)
                    .WithMany(u => u.TaughtClasses)
                    .HasForeignKey(e => e.TeacherId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Subject)
                    .WithMany(s => s.Classes)
                    .HasForeignKey(e => e.SubjectId);
            });

            // StudentClass
            modelBuilder.Entity<StudentClass>(entity =>
            {
                entity.HasKey(e => new { e.StudentId, e.ClassId });
            });

            // Exam
            modelBuilder.Entity<Exam>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            // Question
            modelBuilder.Entity<Question>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).HasConversion<string>();
            });

            // QuestionExam
            modelBuilder.Entity<QuestionExam>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            // ExamStudent
            modelBuilder.Entity<ExamStudent>(entity =>
            {
                entity.HasKey(e => new { e.ExamId, e.StudentId });
                entity.Property(e => e.Status).HasConversion<string>();
            });

            // StudentQuestion
            modelBuilder.Entity<StudentQuestion>(entity =>
            {
                entity.HasKey(e => new { e.StudentId, e.QuestionExamId });
            });
        }
    } 
}
