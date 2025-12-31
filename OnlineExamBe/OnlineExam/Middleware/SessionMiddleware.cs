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
            string path = context.Request.Path;

            // Bỏ qua WebSocket requests (auth qua query param ở ExamWebSocketMiddleware)
            if (path.Trim().ToLower().StartsWith("/ws"))
            {
                await _next(context);
                return;
            }

            if (path.Trim().ToLower().Contains("api/auth/"))
            {
                await _next(context);
                return;
            }

            var sessionString = context.Request.Headers["Session"].FirstOrDefault();
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
                new Claim("Permissions",string.Join(",", session.UserPermission))

            };

            var identity = new ClaimsIdentity(claims, "SessionAuth");
            context.User = new ClaimsPrincipal(identity);
            context.Items["UserSession"] = session;
            await _next(context);
        }
    }
}
