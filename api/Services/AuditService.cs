using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models.Entities;
using Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Api.Data;

namespace Api.Services
{
    /// <summary>
    /// Implements audit logging operations.  Audit events provide
    /// immutable records of critical actions for compliance and
    /// forensic analysis.  Retrieval supports filtering and date
    /// ranges; results are ordered descending by timestamp.
    /// </summary>
    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _dbContext;
        public AuditService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <inheritdoc />
        public async Task RecordEventAsync(int actorId, string action, string entityType, int? entityId, string? payload, string ipAddress, string userAgent)
        {
            var audit = new AuditEvent
            {
                ActorId = actorId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId?.ToString() ?? string.Empty,
                Payload = payload,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.AuditEvents.Add(audit);
            await _dbContext.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<AuditEvent>> GetAuditEventsAsync(int? actorId = null, string? entityType = null, string? action = null, DateTime? from = null, DateTime? to = null)
        {
            IQueryable<AuditEvent> query = _dbContext.AuditEvents.Include(ae => ae.Actor);
            if (actorId.HasValue)
            {
                query = query.Where(ae => ae.ActorId == actorId.Value);
            }
            if (!string.IsNullOrWhiteSpace(entityType))
            {
                query = query.Where(ae => ae.EntityType == entityType);
            }
            if (!string.IsNullOrWhiteSpace(action))
            {
                query = query.Where(ae => ae.Action == action);
            }
            if (from.HasValue)
            {
                query = query.Where(ae => ae.CreatedAt >= from.Value);
            }
            if (to.HasValue)
            {
                query = query.Where(ae => ae.CreatedAt <= to.Value);
            }
            return await query.OrderByDescending(ae => ae.CreatedAt).ToListAsync();
        }
    }
}