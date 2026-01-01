using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Services.Auth;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System.Security.Claims;

namespace OnlineExam.Attributes
{
    public class SessionAuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        //private readonly UserRole[] _roles = { UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER };
        private readonly string[]? _perCodes ;
        public SessionAuthorizeAttribute(params string[] perCodes )
        {
            // _roles = roles.Length > 0 ? roles : new[] { UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER };
            _perCodes = perCodes ?? Array.Empty<string>(); ;

        }

         void IAuthorizationFilter.OnAuthorization(AuthorizationFilterContext context)
        {
            var metadata = context.ActionDescriptor.EndpointMetadata
                          .OfType<SessionAuthorizeAttribute>()
                          .FirstOrDefault();

            var actualCodes = metadata?._perCodes ?? this._perCodes;

            var userRole = context.HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == UserRole.ADMIN.ToString()) return;

            // chi admin moi co quyen thuc hien
            if (actualCodes == null)
            {
                context.Result = new UnauthorizedObjectResult("Forbidden: You do not have permission to perform this action.");
                return;
            }
            string pass = "F0000";
            if (actualCodes.Contains(pass))
            {
                return;
            }
            var permissionsClaim = context.HttpContext.User.FindFirst("Permissions")?.Value;
            if (!string.IsNullOrEmpty(permissionsClaim))
            {
                var hasPermission = permissionsClaim.Split(",")
                                                     .Intersect(actualCodes.Select(p => p.Trim()).ToArray());
                if (hasPermission.Any())
                {
                    return;
                }
                else
                {
                    context.Result = new UnauthorizedObjectResult("Forbidden: You do not have permission to perform this action.");
                    return;
                }
            }
            else
            {
                context.Result = new UnauthorizedObjectResult("Unauthorized");
                return;
            }
            

        }
    }
}
