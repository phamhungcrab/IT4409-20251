using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Api.Hubs
{
    /// <summary>
    /// SignalR hub used by teachers and administrators to monitor
    /// exam sessions in real time.  This hub allows clients to join
    /// groups representing specific exams and receive updates about
    /// participants’ progress, status changes and announcements.  The
    /// hub can also be used to broadcast commands (e.g., force
    /// submission) to ExamHub groups.  The actual monitoring logic
    /// should be implemented in server side services which invoke
    /// these hub methods.
    /// </summary>
    [Authorize(Roles = "ADMIN,TEACHER")]
    public class MonitoringHub : Hub
    {
        /// <summary>
        /// Join the caller to a group that represents all sessions
        /// associated with a particular exam.  Group names should
        /// follow a convention such as "exam-42" so that all
        /// monitoring clients receive updates for that exam.
        /// </summary>
        /// <param name="examGroup">The group name (e.g., "exam-42").</param>
        public async Task JoinExamGroup(string examGroup)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, examGroup);
            await Clients.Caller.SendAsync("JoinedExamGroup", examGroup);
        }

        /// <summary>
        /// Broadcast a participant status update to monitoring clients.
        /// The service layer should call this when a student joins,
        /// leaves or progresses in an exam.  Clients can update
        /// dashboards accordingly.
        /// </summary>
        /// <param name="examGroup">The exam group (e.g., "exam-42").</param>
        /// <param name="participantId">Identifier of the student.</param>
        /// <param name="status">A summary of the participant’s status (e.g., "IN_PROGRESS", "COMPLETED").</param>
        public async Task BroadcastParticipantStatus(string examGroup, int participantId, string status)
        {
            await Clients.Group(examGroup).SendAsync("ParticipantStatusUpdated", new { participantId, status });
        }

        /// <summary>
        /// Broadcast an aggregated summary update for an exam.  This
        /// could include total number of participants, counts of
        /// completed sessions, average score, etc.  Dashboard clients
        /// can use this to update summary widgets.
        /// </summary>
        /// <param name="examGroup">The exam group (e.g., "exam-42").</param>
        /// <param name="summary">An arbitrary summary object.</param>
        public async Task BroadcastSummary(string examGroup, object summary)
        {
            await Clients.Group(examGroup).SendAsync("ExamSummaryUpdated", summary);
        }

        /// <summary>
        /// Broadcast a global announcement to all students in a given
        /// exam.  This method forwards the message to the ExamHub
        /// session groups by constructing their names (e.g., by
        /// combining the exam ID and each student ID).  For
        /// simplicity this stub just sends the message to the
        /// monitoring group itself.  Implementation details can vary.
        /// </summary>
        /// <param name="examGroup">The exam group (e.g., "exam-42").</param>
        /// <param name="message">Announcement text.</param>
        public async Task BroadcastExamAnnouncement(string examGroup, string message)
        {
            // In a full implementation, this might iterate over
            // individual session groups and invoke ExamHub.BroadcastAnnouncement.
            await Clients.Group(examGroup).SendAsync("ReceiveAnnouncement", message);
        }
    }
}