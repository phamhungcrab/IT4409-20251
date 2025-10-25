using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models.Entities;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Hubs;

namespace Api.Services
{
    /// <summary>
    /// Provides real‑time monitoring data for exams and allows
    /// posting announcements.  This service aggregates information
    /// from the database and optional SignalR hubs to produce
    /// dashboards for teachers and admins.
    /// </summary>
    public class MonitoringService : IMonitoringService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHubContext<MonitoringHub> _monitoringHub;

        public MonitoringService(ApplicationDbContext dbContext, IHubContext<MonitoringHub> monitoringHub)
        {
            _dbContext = dbContext;
            _monitoringHub = monitoringHub;
        }

        /// <inheritdoc />
        public async Task<IDictionary<string, object>> GetExamMonitoringDataAsync(int examId)
        {
            var result = new Dictionary<string, object>();
            var exam = await _dbContext.Exams
                .Include(e => e.ExamStudents)
                    .ThenInclude(es => es.StudentQuestions)
                .SingleOrDefaultAsync(e => e.Id == examId);
            if (exam == null)
            {
                throw new KeyNotFoundException($"Exam {examId} not found");
            }
            int totalStudents = exam.ExamStudents.Count;
            int onlineStudents = exam.ExamStudents.Count(es => es.Status == Api.Models.Enumerations.ExamStatus.InProgress.ToString());
            int completedStudents = exam.ExamStudents.Count(es => es.Status == Api.Models.Enumerations.ExamStatus.Completed.ToString());
            // Average progress: percentage of questions answered
            double avgProgress = 0;
            if (totalStudents > 0)
            {
                avgProgress = exam.ExamStudents
                    .Select(es => es.StudentQuestions.Count == 0 ? 0 : es.StudentQuestions.Count(sq => sq.SelectedOptionIds != null || sq.EssayAnswer != null) * 1.0 / es.StudentQuestions.Count)
                    .Average() * 100;
            }
            result["totalStudents"] = totalStudents;
            result["onlineStudents"] = onlineStudents;
            result["completedStudents"] = completedStudents;
            result["averageProgress"] = Math.Round(avgProgress, 2);
            // Provide a list of participant statuses
            var statuses = exam.ExamStudents.Select(es => new
            {
                es.StudentId,
                StudentName = es.Student.FullName ?? es.Student.Email,
                es.Status,
                es.StartTime,
                es.EndTime
            }).ToList();
            result["participants"] = statuses;
            return result;
        }

        /// <inheritdoc />
        public async Task PostAnnouncementAsync(int examId, string message, int senderId)
        {
            // Persist the announcement
            var announcement = new Announcement
            {
                ExamId = examId,
                CreatedById = senderId,
                Message = message,
                Severity = "info",
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Announcements.Add(announcement);
            await _dbContext.SaveChangesAsync();
            // Broadcast to all clients connected to the exam group via SignalR
            await _monitoringHub.Clients.Group($"Exam_{examId}").SendAsync("ReceiveAnnouncement", new { announcement.Id, announcement.Message, announcement.Severity, announcement.CreatedAt });
        }
    }
}