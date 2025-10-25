using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Api.Middleware
{
    /// <summary>
    /// Middleware that catches unhandled exceptions and converts
    /// them into standardized JSON error responses.  It also
    /// differentiates between common error types (e.g., unauthorized,
    /// validation errors) and writes appropriate HTTP status codes.
    /// </summary>
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Default to 500 Internal Server Error
            HttpStatusCode status = HttpStatusCode.InternalServerError;
            string message = "An unexpected error occurred.";
            switch (exception)
            {
                case UnauthorizedAccessException:
                    status = HttpStatusCode.Unauthorized;
                    message = "Unauthorized access.";
                    break;
                case ArgumentException:
                case InvalidOperationException:
                    status = HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;
                case System.ComponentModel.DataAnnotations.ValidationException ve:
                    status = HttpStatusCode.BadRequest;
                    message = ve.Message;
                    break;
                // add more specific cases as needed
                default:
                    _logger.LogError(exception, "Unhandled exception occurred while processing request {Path}", context.Request.Path);
                    break;
            }
            var errorResponse = new { error = message };
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)status;
            await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
        }
    }
}