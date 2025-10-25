using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Models.Entities;

namespace Api.Services.Interfaces
{
    /// <summary>
    /// Defines operations for recording and retrieving audit events.
    /// Audit events capture sensitive actions (e.g., publishing an
    /// exam, grading changes) and help meet compliance and
    /// accountability requirements.  Implementations should ensure
    /// that audit records are immutable and append‑only.
    /// </summary>
    public interface IAuditService
    {
        /// <summary>
        /// Record an audit event.  The payload may contain
        /// additional context serialized as JSON.  IP and userAgent
        /// information should be captured from the request context.
        /// </summary>
        Task RecordEventAsync(int actorId, string action, string entityType, int? entityId, string? payload, string ipAddress, string userAgent);

        /// <summary>
        /// Retrieve audit events filtered by actor, entity type, action
        /// and date range.  Results should be ordered descending by
        /// createdAt.  Paging should be supported for large result sets.
        /// </summary>
        Task<IReadOnlyList<AuditEvent>> GetAuditEventsAsync(int? actorId = null, string? entityType = null, string? action = null, DateTime? from = null, DateTime? to = null);
    }
}