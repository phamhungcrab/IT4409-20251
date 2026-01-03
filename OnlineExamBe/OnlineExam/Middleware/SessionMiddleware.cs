using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Domain.Enums;
using StackExchange.Redis;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OnlineExam.Middleware
{
    public class SessionMiddleware
    {
        private readonly RequestDelegate _next;
        public SessionMiddleware(RequestDelegate next )
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ISessionService _sessionService)
        {
            string path = context.Request.Path.ToString().Trim().ToLower();

            // Bypass cho WebSocket và các API auth không cần session
            if (path.StartsWith("/ws") ||
                path.Contains("api/auth/login") ||
                path.Contains("api/auth/reset-password") ||
                path.Contains("api/auth/send-otp") ||
                path.Contains("api/auth/check-otp"))
            {
                await _next(context);
                return;
            }

            // Lấy session từ Header, nếu không có thì thử từ Query param
            var sessionString = context.Request.Headers["Session"].FirstOrDefault();

            //if (path.Trim().ToLower().Contains("wss://") || path.Trim().ToLower().Contains("wss://"))
            //    sessionString = context.Request.Query["Session"].FirstOrDefault();


            if (string.IsNullOrEmpty(sessionString))
            {
                sessionString = context.Request.Query["session"].FirstOrDefault();
            }

            if (string.IsNullOrEmpty(sessionString))
            {
                context.Response.StatusCode = ResponseCode.Unauthorized;
                await context.Response.WriteAsync("Missing session.");
                return;
            }

                var session = await _sessionService.ValidateSession(sessionString);


            if (session == null)
            {
                context.Response.StatusCode = ResponseCode.Unauthorized;
                await context.Response.WriteAsync("Session expired or invalid.");
                return;
            }

            await _sessionService.ExtendSessionAsync(sessionString);


            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, session.UserId.ToString()),
                new Claim(ClaimTypes.Role, session.UserRole.ToString()),
                new Claim(ClaimTypes.Name, session.FullName),
                new Claim(ClaimTypes.Email, session.Email),
                new Claim(ClaimTypes.DateOfBirth, session.DateOfBirth.ToString()),
                new Claim("MSSV", session.MSSV),
                new Claim("Permissions",string.Join(",", session.UserPermission.Select(c => c.Code)))

            };

            var identity = new ClaimsIdentity(claims, "SessionAuth");
            context.User = new ClaimsPrincipal(identity);
            context.Items["UserSession"] = session;
            await _next(context);
        }
    }
}
