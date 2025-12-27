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
        public DbSet<Session> Session { get; set; }
        public DbSet<ExamBlueprint> ExamBlueprints { get; set; }
        public DbSet<GroupPermission> GroupPermissions { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }


        public DbSet<ExamBlueprintChapter> ExamBlueprintChapters { get; set; }
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

            modelBuilder.Entity<Subject>()
                .Property(s => s.TotalChapters)
                .HasDefaultValue(1);

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

                entity.HasOne(e => e.Class)
                      .WithMany(c => c.Exams)
                      .HasForeignKey(e => e.ClassId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Blueprint)
                      .WithMany()
                      .HasForeignKey(e => e.BlueprintId)
                      .OnDelete(DeleteBehavior.Restrict);
            });


            // Question
            modelBuilder.Entity<Question>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).HasConversion<string>();
            });

            modelBuilder.Entity<Question>()
                .Property(q => q.Difficulty)
                .HasConversion<string>();


            modelBuilder.Entity<Question>()
                .Property(q => q.Chapter)
                .HasDefaultValue(1)
                .IsRequired();

            // QuestionExam
            modelBuilder.Entity<QuestionExam>(entity =>
            {
                entity.HasKey(qe => new { qe.ExamId, qe.StudentId, qe.QuestionId });

                entity.HasOne(qe => qe.Student)
                    .WithMany(u => u.QuestionExams)
                    .HasForeignKey(qe => qe.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(qe => qe.Exam)
                    .WithMany(e => e.QuestionExams)
                    .HasForeignKey(qe => qe.ExamId)
                    .OnDelete(DeleteBehavior.Cascade);

                // FK → Question
                entity.HasOne(qe => qe.Question)
                    .WithMany(q => q.QuestionExams)
                    .HasForeignKey(qe => qe.QuestionId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Index tối ưu hóa truy vấn
                entity.HasIndex(qe => new { qe.ExamId, qe.StudentId })
                    .HasDatabaseName("IX_QuestionExam_Exam_Student");

                entity.Property(qe => qe.Order)
                    .IsRequired();
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
                // Composite key matching QuestionExam
                entity.HasKey(sq => new { sq.ExamId, sq.StudentId, sq.QuestionId });

                // FK → QuestionExam (full composite match)
                entity.HasOne(sq => sq.QuestionExam)
                    .WithMany(qe => qe.StudentQuestions)
                    .HasForeignKey(sq => new { sq.ExamId, sq.StudentId, sq.QuestionId })
                    .OnDelete(DeleteBehavior.Cascade);

                // FK → Student
                entity.HasOne(sq => sq.Student)
                    .WithMany(u => u.StudentQuestions)
                    .HasForeignKey(sq => sq.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            //RefreshExam
            modelBuilder.Entity<Session>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Session)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                 
            });

            //ExamBlueprint
            modelBuilder.Entity<ExamBlueprint>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.Chapters)
                      .WithOne(c => c.Blueprint)
                      .HasForeignKey(c => c.BlueprintId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ExamBlueprintChapter>(entity =>
            {
                entity.ToTable("ExamBlueprintChapters"); 
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<GroupPermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();

            });

            modelBuilder.Entity<Permission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.HasOne(e => e.GroupPermission)
                      .WithMany(c => c.ListChildPermission)
                      .HasForeignKey(e => e.GroupPermissionId);

            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
            });

            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Permission)
                      .WithMany(c => c.RolePermissions)
                      .HasForeignKey(e => e.PermissionId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Role)
                      .WithMany(c => c.RolePermissions)
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserPermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Permission)
                      .WithMany(c => c.UserPermissions)
                      .HasForeignKey(e => e.PermissionId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.User)
                      .WithMany(c => c.UserPermissions)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });


        }
    } 
}
