using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Api.Hubs
{
    /// <summary>
    /// SignalR hub used by students during an exam session.  The
    /// frontend connects to this hub over WSS to receive server
    /// authoritative timer ticks, announcements and other exam
    /// updates in real time.  It also allows clients to join exam
    /// specific groups so that messages are scoped appropriately.  All
    /// methods here are stubs; actual implementation should
    /// coordinate with the ExamSessionController and MonitoringHub.
    /// </summary>
    [Authorize]
    public class ExamHub : Hub
    {
        /// <summary>
        /// Called when a client connects to the hub.  You can perform
        /// initialization here, such as adding the connection to a
        /// global list or sending a welcome message.  The base
        /// implementation simply completes the connection.
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            // Optionally perform actions when a client connects.  For
            // example, you could retrieve the exam ID from a query
            // string and automatically add the connection to a group.
            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Called when a client disconnects.  Use this to remove the
        /// connection from any groups or perform cleanup.  In a real
        /// implementation you might record that the student went
        /// offline and update monitoring dashboards.
        /// </summary>
        public override async Task OnDisconnectedAsync(System.Exception? exception)
        {
            // Remove the connection from groups or update state
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Join the caller to a SignalR group representing a specific
        /// exam session.  Group names should be unique per exam
        /// assignment (e.g., "exam-42-student-7") to ensure messages
        /// are scoped to the appropriate participants.  The client
        /// should call this immediately after connecting, passing the
        /// session identifier received from the ExamSessionController.
        /// </summary>
        /// <param name="sessionGroup">A unique group name for the
        /// session (e.g., exam and student IDs concatenated).</param>
        public async Task JoinSessionGroup(string sessionGroup)
        {
            // Add the current connection to the specified SignalR group
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionGroup);
            // Optionally send an acknowledgement to the caller
            await Clients.Caller.SendAsync("JoinedSession", sessionGroup);
        }

        /// <summary>
        /// Broadcast a timer update to all participants in the session.
        /// The server (via a hosted service) should invoke this
        /// method periodically to enforce server authoritative timing.
        /// Clients should update their displays based on the remaining
        /// time value rather than relying on their local clocks.
        /// </summary>
        /// <param name="sessionGroup">The session group to broadcast to.</param>
        /// <param name="remainingSeconds">Number of seconds left.</param>
        public async Task BroadcastTimer(string sessionGroup, int remainingSeconds)
        {
            // Broadcast to everyone in the group.  In practice this
            // method would be called from a background service rather
            // than invoked by a client.
            await Clients.Group(sessionGroup).SendAsync("TimerUpdate", remainingSeconds);
        }

        /// <summary>
        /// Send an announcement message to all participants in a
        /// session.  Teachers may also broadcast to the entire class
        /// via MonitoringHub.  Clients should display announcements
        /// prominently.
        /// </summary>
        /// <param name="sessionGroup">The session group to broadcast to.</param>
        /// <param name="message">The announcement message.</param>
        public async Task BroadcastAnnouncement(string sessionGroup, string message)
        {
            await Clients.Group(sessionGroup).SendAsync("ReceiveAnnouncement", message);
        }
    }
}