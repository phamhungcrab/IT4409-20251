using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Services.Auth;

namespace OnlineExam.Attributes
{
    public class SessionAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string[] _roles;
        public SessionAuthorizeAttribute(params string[] roles )
        {
            _roles = roles;
        }

        async Task IAsyncAuthorizationFilter.OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var _sessionService = context.HttpContext.RequestServices.GetRequiredService<ISessionService>();

            var sessionString = context.HttpContext.Request.Headers["Session"].FirstOrDefault();
            if (string.IsNullOrEmpty(sessionString))
            {
                context.Result = new UnauthorizedObjectResult("Missing session.");
                return;
            }
            var isValid = false;
                var session = await _sessionService.GetBySessionStringAsync(sessionString);
            if (session != null)
            {
                var userId = session.UserId;
                var userRole = session.UserRole;
                isValid = await _sessionService.ValidateSession(sessionString, userRole, userId);
                
            }
            isValid = await _sessionService.ValidateSession(sessionString);

            if (!isValid)
            {
                context.Result = new UnauthorizedObjectResult("Session expired or invalid.");
                return;
            }
        }
    }
}
