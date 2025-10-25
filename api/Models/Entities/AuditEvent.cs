using System;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents an audit log entry for a sensitive action.  Records
    /// who performed the action, what entity was affected and
    /// contextual metadata such as IP address and user agent.  Use
    /// this table for compliance and forensic investigations.  All
    /// writes should be append-only.
    /// </summary>
    public class AuditEvent
    {
        public long Id { get; set; }

        /// <summary>
        /// Foreign key to the user who performed the action.  Null if
        /// the action was performed by an automated system or
        /// unauthenticated context.
        /// </summary>
        public int? ActorId { get; set; }
;
        /// <summary>
        /// The action taken (e.g., "CREATE_EXAM", "DELETE_USER").
        /// </summary>
        public string Action { get; set; } = string.Empty;

        /// <summary>
        /// The type of entity affected (e.g., "Exam", "User").
        /// </summary>
        public string EntityType { get; set; } = string.Empty;

        /// <summary>
        /// Identifier of the entity affected.  Stored as a string to
        /// allow composite keys or GUIDs.
        /// </summary>
        public string EntityId { get; set; } = string.Empty;

        /// <summary>
        /// Optional JSON payload capturing the state change or
        /// additional data.  Keep this small to avoid bloating the log.
        /// </summary>
        public string? Payload { get; set; }
;
        /// <summary>
        /// IP address of the actor, if available.
        /// </summary>
        public string? IpAddress { get; set; }
;
        /// <summary>
        /// User agent string of the actor’s browser/client.
        /// </summary>
        public string? UserAgent { get; set; }
;
        /// <summary>
        /// Timestamp when the audit event was recorded (UTC).
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Navigation to the actor (user).
        /// </summary>
        public virtual User? Actor { get; set; }
;
    }
}