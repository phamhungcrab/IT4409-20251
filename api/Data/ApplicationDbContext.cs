using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Data
{
    /// <summary>
    /// Entity Framework Core database context for the Online
    /// Examination System.  Exposes DbSet properties for each
    /// aggregate root and configures relationships using the
    /// fluent API.  Additional entity configurations can be
    /// separated into separate classes in a Configurations folder.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Subject> Subjects { get; set; } = null!;
        public DbSet<Class> Classes { get; set; } = null!;
        public DbSet<Question> Questions { get; set; } = null!;
        public DbSet<Option> Options { get; set; } = null!;
        public DbSet<Exam> Exams { get; set; } = null!;
        public DbSet<QuestionExam> QuestionExams { get; set; } = null!;
        public DbSet<ExamStudent> ExamStudents { get; set; } = null!;
        public DbSet<StudentQuestion> StudentQuestions { get; set; } = null!;
        public DbSet<Answer> Answers { get; set; } = null!;
        public DbSet<Score> Scores { get; set; } = null!;
        public DbSet<Announcement> Announcements { get; set; } = null!;
        public DbSet<AuditEvent> AuditEvents { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configure composite keys and relationships as necessary.
            modelBuilder.Entity<ExamStudent>()
                .HasIndex(es => new { es.ExamId, es.StudentId })
                .IsUnique();
            modelBuilder.Entity<Class>()
                .HasMany(c => c.Students)
                .WithMany(u => u.EnrolledClasses)
                .UsingEntity(j => j.ToTable("StudentClasses"));
            // Optionally configure string properties to have max lengths
            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .HasMaxLength(255);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}