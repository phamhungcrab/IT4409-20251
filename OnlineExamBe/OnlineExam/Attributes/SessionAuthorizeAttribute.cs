using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Services.Auth;
using OnlineExam.Domain.Enums;
using System.Security.Claims;

namespace OnlineExam.Attributes
{
    public class SessionAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly UserRole[] _roles = [UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER];

        public SessionAuthorizeAttribute(params UserRole[] roles )
        {
            _roles = roles;
        }

        async Task IAsyncAuthorizationFilter.OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var _sessionService = context.HttpContext.RequestServices.GetRequiredService<ISessionService>();
            var _userService = context.HttpContext.RequestServices.GetRequiredService<IUserService>();

            var sessionString = context.HttpContext.Request.Headers["Session"].FirstOrDefault();
            if (string.IsNullOrEmpty(sessionString))
            {
                context.Result = new UnauthorizedObjectResult("Missing session.");
                return;
            }
            
            
               var session = await _sessionService.ValidateSession(sessionString, _roles);
 

            if (session == null)
            {
                context.Result = new UnauthorizedObjectResult("Session expired or invalid.");
                return;
            }

            //var session = await _sessionService.GetBySessionStringAsync(sessionString);
            //var user = await _userService.GetByIdAsync(session!.UserId);
            //var claims = new List<Claim>
            //{
            //    new Claim(ClaimTypes.NameIdentifier, session.UserId.ToString()),
            //    new Claim(ClaimTypes.Role, session.UserRole.ToString()),
            //    new Claim(ClaimTypes.Name, user.FullName),
            //    new Claim(ClaimTypes.Email, user.Email),
            //    new Claim("MSSV", user.MSSV)
            //};

            //var identity = new ClaimsIdentity(claims, "SessionAuth");
            //context.HttpContext.User = new ClaimsPrincipal(identity);
        }
    }
}
