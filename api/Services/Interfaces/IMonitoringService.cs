using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Models.Entities;

namespace Api.Services.Interfaces
{
    /// <summary>
    /// Defines methods for retrieving real‑time monitoring data and
    /// broadcasting announcements during an exam.  The monitoring
    /// service combines information from the database and
    /// in‑memory session state (e.g., SignalR connections) to
    /// generate participant status and progress reports.  It
    /// complements the SignalR hubs by providing server‑authoritative
    /// views【329956817899352†L59-L84】.
    /// </summary>
    public interface IMonitoringService
    {
        /// <summary>
        /// Retrieve a summary of participants and progress for a
        /// given exam.  The returned dictionary may include keys
        /// such as "totalStudents", "onlineStudents", "averageProgress",
        /// and a list of per‑student statuses.  Implementations
        /// should avoid exposing sensitive data.
        /// </summary>
        Task<IDictionary<string, object>> GetExamMonitoringDataAsync(int examId);

        /// <summary>
        /// Send an announcement to all participants in an exam.  The
        /// message is persisted to the database via the
        /// <see cref="Announcement"/> entity and delivered to
        /// connected clients via SignalR.  The senderId identifies
        /// the teacher or admin posting the announcement.
        /// </summary>
        Task PostAnnouncementAsync(int examId, string message, int senderId);
    }
}