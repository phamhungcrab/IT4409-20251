using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models.Entities;
using Api.Models.Enumerations;
using Microsoft.EntityFrameworkCore;

namespace Api.Data
{
    /// <summary>
    /// Provides methods to seed the database with initial data for
    /// development or testing.  This seeding is idempotent and will
    /// not duplicate entries on repeated calls.  Use this class in
    /// Startup or migrations to ensure the database has baseline
    /// records.
    /// </summary>
    public static class SeedData
    {
        public static async Task InitializeAsync(ApplicationDbContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();
            // Seed users
            if (!context.Users.Any())
            {
                var admin = new User
                {
                    Email = "admin@example.com",
                    FullName = "System Admin",
                    PasswordHash = "hashed-password", // TODO: hash properly
                    Role = Role.ADMIN,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                var teacher = new User
                {
                    Email = "teacher@example.com",
                    FullName = "Jane Teacher",
                    PasswordHash = "hashed-password",
                    Role = Role.TEACHER,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                var student = new User
                {
                    Email = "student@example.com",
                    FullName = "John Student",
                    PasswordHash = "hashed-password",
                    Role = Role.STUDENT,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.Users.AddRange(admin, teacher, student);
                await context.SaveChangesAsync();
            }
            // Seed subjects
            if (!context.Subjects.Any())
            {
                var subject = new Subject
                {
                    SubjectCode = "CS101",
                    Name = "Introduction to Programming",
                    Description = "Basic programming concepts"
                };
                context.Subjects.Add(subject);
                await context.SaveChangesAsync();
            }
            // Seed class
            if (!context.Classes.Any())
            {
                var subject = await context.Subjects.FirstAsync();
                var teacher = await context.Users.FirstAsync(u => u.Role == Role.TEACHER);
                var cls = new Class
                {
                    Name = "CS101-A",
                    SubjectId = subject.Id,
                    TeacherId = teacher.Id
                };
                // Assign student to class
                var student = await context.Users.FirstAsync(u => u.Role == Role.STUDENT);
                cls.Students.Add(student);
                context.Classes.Add(cls);
                await context.SaveChangesAsync();
            }
            // Seed questions
            if (!context.Questions.Any())
            {
                var subject = await context.Subjects.FirstAsync();
                var question = new Question
                {
                    SubjectId = subject.Id,
                    Text = "What is the capital of France?",
                    Type = QuestionType.SingleChoice,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Options = new List<Option>
                    {
                        new Option { Text = "Paris", IsCorrect = true, Order = 1 },
                        new Option { Text = "London", IsCorrect = false, Order = 2 },
                        new Option { Text = "Rome", IsCorrect = false, Order = 3 }
                    }
                };
                context.Questions.Add(question);
                await context.SaveChangesAsync();
            }
            // Seed exam
            if (!context.Exams.Any())
            {
                var teacher = await context.Users.FirstAsync(u => u.Role == Role.TEACHER);
                var exam = new Exam
                {
                    Title = "Sample Exam",
                    Description = "Demo exam for seeding",
                    StartTimeUtc = DateTime.UtcNow.AddDays(1),
                    EndTimeUtc = DateTime.UtcNow.AddDays(1).AddHours(2),
                    AuthorId = teacher.Id,
                    IsPublished = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.Exams.Add(exam);
                await context.SaveChangesAsync();
            }
        }
    }
}