using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models.DTOs.Exam;
using Api.Models.Entities;
using Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Api.Data;

namespace Api.Services
{
    /// <summary>
    /// Implements exam management operations including creating,
    /// updating, deleting, publishing and assigning exams.  Many
    /// details are simplified for brevity; for example, question
    /// snapshotting and assignment rules should follow the
    /// specification regarding immutability and randomization【329956817899352†L59-L84】.
    /// </summary>
    public class ExamService : IExamService
    {
        private readonly ApplicationDbContext _dbContext;

        public ExamService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <inheritdoc />
        public async Task<ExamResponse> CreateExamAsync(CreateExamRequest request, int authorId)
        {
            if (request.StartTimeUtc >= request.EndTimeUtc)
            {
                throw new ArgumentException("Start time must be before end time");
            }
            var exam = new Exam
            {
                Title = request.Title,
                Description = request.Description,
                StartTimeUtc = request.StartTimeUtc,
                EndTimeUtc = request.EndTimeUtc,
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsPublished = false
            };
            _dbContext.Exams.Add(exam);
            await _dbContext.SaveChangesAsync();
            // Optionally assign to classes or students
            if (request.ClassIds != null && request.ClassIds.Any())
            {
                await AssignExamToClassesAsync(exam.Id, request.ClassIds);
            }
            if (request.StudentIds != null && request.StudentIds.Any())
            {
                await AssignExamToStudentsAsync(exam.Id, request.StudentIds);
            }
            return await GetExamByIdAsync(exam.Id);
        }

        /// <inheritdoc />
        public async Task<ExamResponse> UpdateExamAsync(int examId, CreateExamRequest request)
        {
            var exam = await _dbContext.Exams.FindAsync(examId);
            if (exam == null)
            {
                throw new KeyNotFoundException($"Exam {examId} not found");
            }
            if (exam.IsPublished)
            {
                throw new InvalidOperationException("Cannot edit a published exam");
            }
            exam.Title = request.Title;
            exam.Description = request.Description;
            exam.StartTimeUtc = request.StartTimeUtc;
            exam.EndTimeUtc = request.EndTimeUtc;
            exam.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return await GetExamByIdAsync(exam.Id);
        }

        /// <inheritdoc />
        public async Task DeleteExamAsync(int examId)
        {
            var exam = await _dbContext.Exams.FindAsync(examId);
            if (exam == null)
            {
                throw new KeyNotFoundException($"Exam {examId} not found");
            }
            // Soft delete published exams
            if (exam.IsPublished)
            {
                exam.IsDeleted = true;
            }
            else
            {
                _dbContext.Exams.Remove(exam);
            }
            await _dbContext.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task PublishExamAsync(int examId, PublishExamRequest? request = null)
        {
            var exam = await _dbContext.Exams.Include(e => e.QuestionExams).FirstOrDefaultAsync(e => e.Id == examId);
            if (exam == null)
            {
                throw new KeyNotFoundException($"Exam {examId} not found");
            }
            if (exam.IsPublished)
            {
                throw new InvalidOperationException("Exam is already published");
            }
            // Snapshot questions: For demonstration we do not implement the
            // snapshot logic here.  In a full implementation you would
            // iterate through the question IDs associated with the exam,
            // copy the question text and options into QuestionExam
            // entities and attach them to the exam.
            exam.IsPublished = true;
            exam.PublishedAtUtc = request?.PublishAtUtc ?? DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task AssignExamToClassesAsync(int examId, IEnumerable<int> classIds)
        {
            var exam = await _dbContext.Exams.FindAsync(examId);
            if (exam == null)
            {
                throw new KeyNotFoundException($"Exam {examId} not found");
            }
            foreach (var classId in classIds)
            {
                var @class = await _dbContext.Classes.Include(c => c.Students).FirstOrDefaultAsync(c => c.Id == classId);
                if (@class == null) continue;
                foreach (var student in @class.Students)
                {
                    // Check if student already assigned
                    bool exists = await _dbContext.ExamStudents.AnyAsync(es => es.ExamId == examId && es.StudentId == student.Id);
                    if (!exists)
                    {
                        _dbContext.ExamStudents.Add(new ExamStudent
                        {
                            ExamId = examId,
                            StudentId = student.Id,
                            Status = Models.Enumerations.ExamStatus.NotStarted,
                            AssignedAt = DateTime.UtcNow
                        });
                    }
                }
            }
            await _dbContext.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task AssignExamToStudentsAsync(int examId, IEnumerable<int> studentIds)
        {
            foreach (var studentId in studentIds)
            {
                bool exists = await _dbContext.ExamStudents.AnyAsync(es => es.ExamId == examId && es.StudentId == studentId);
                if (!exists)
                {
                    _dbContext.ExamStudents.Add(new ExamStudent
                    {
                        ExamId = examId,
                        StudentId = studentId,
                        Status = Models.Enumerations.ExamStatus.NotStarted,
                        AssignedAt = DateTime.UtcNow
                    });
                }
            }
            await _dbContext.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task<ExamResponse> GetExamByIdAsync(int examId)
        {
            var exam = await _dbContext.Exams
                .Include(e => e.QuestionExams)
                .Include(e => e.Author)
                .SingleOrDefaultAsync(e => e.Id == examId);
            if (exam == null)
            {
                throw new KeyNotFoundException($"Exam {examId} not found");
            }
            return new ExamResponse
            {
                Id = exam.Id,
                Title = exam.Title,
                Description = exam.Description,
                StartTimeUtc = exam.StartTimeUtc,
                EndTimeUtc = exam.EndTimeUtc,
                IsPublished = exam.IsPublished,
                PublishedAtUtc = exam.PublishedAtUtc,
                Author = new Api.Models.DTOs.User.UserResponse
                {
                    Id = exam.Author.Id,
                    Email = exam.Author.Email,
                    FullName = exam.Author.FullName,
                    Role = exam.Author.Role.ToString()
                },
                QuestionCount = exam.QuestionExams?.Count ?? 0
            };
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<ExamResponse>> GetExamsAsync(int? authorId = null, bool? onlyPublished = null)
        {
            IQueryable<Exam> query = _dbContext.Exams.Include(e => e.QuestionExams).Include(e => e.Author);
            if (authorId.HasValue)
            {
                query = query.Where(e => e.AuthorId == authorId.Value);
            }
            if (onlyPublished.HasValue)
            {
                query = query.Where(e => e.IsPublished == onlyPublished.Value);
            }
            var exams = await query.ToListAsync();
            return exams.Select(e => new ExamResponse
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                StartTimeUtc = e.StartTimeUtc,
                EndTimeUtc = e.EndTimeUtc,
                IsPublished = e.IsPublished,
                PublishedAtUtc = e.PublishedAtUtc,
                Author = new Api.Models.DTOs.User.UserResponse
                {
                    Id = e.Author.Id,
                    Email = e.Author.Email,
                    FullName = e.Author.FullName,
                    Role = e.Author.Role.ToString()
                },
                QuestionCount = e.QuestionExams?.Count ?? 0
            }).ToList();
        }
    }
}