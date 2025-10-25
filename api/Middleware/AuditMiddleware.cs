using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Api.Middleware
{
    /// <summary>
    /// Middleware that records audit events for each HTTP request.
    /// It extracts the user identity, method and path and passes
    /// them to the <see cref="IAuditService"/> for persistence.
    /// Only non-read operations (POST, PUT, DELETE) are recorded
    /// by default to reduce noise.  Errors in the audit service
    /// should not impact the request pipeline.
    /// </summary>
    public class AuditMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AuditMiddleware> _logger;
        private readonly IAuditService _auditService;

        public AuditMiddleware(RequestDelegate next, ILogger<AuditMiddleware> logger, IAuditService auditService)
        {
            _next = next;
            _logger = logger;
            _auditService = auditService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            await _next(context);
            // Only audit write operations
            var method = context.Request.Method;
            if (method != HttpMethods.Post && method != HttpMethods.Put && method != HttpMethods.Delete)
            {
                return;
            }
            try
            {
                // Determine actor ID from claims.  Assume claim type "id" holds the user id.
                int actorId = 0;
                var idClaim = context.User?.FindFirst("id") ?? context.User?.FindFirst(ClaimTypes.NameIdentifier);
                if (idClaim != null && int.TryParse(idClaim.Value, out var parsed))
                {
                    actorId = parsed;
                }
                string action = method;
                string entityType = context.Request.Path;
                // Only numeric ids will be stored in the AuditEvent; pass null otherwise.
                int? entityId = null;
                string? payload = null;
                string ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
                string userAgent = context.Request.Headers.TryGetValue("User-Agent", out var ua) ? ua.ToString() : string.Empty;
                await _auditService.RecordEventAsync(actorId, action, entityType, entityId, payload, ipAddress, userAgent);
            }
            catch (Exception ex)
            {
                // Swallow exceptions to avoid disrupting the pipeline
                _logger.LogError(ex, "Failed to record audit event for {Method} {Path}", context.Request.Method, context.Request.Path);
            }
        }
    }
}