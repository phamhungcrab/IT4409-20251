using Microsoft.AspNetCore.Authorization;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Infrastructure.Policy.Requirements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Infrastructure.Policy.Handlers
{
    public class IsUserAuthorizationHandler : AuthorizationHandler<ResourceRequirement, User>
    {

        /// <summary>
        /// chi chap nhan neu user thuoc quyen so huu
        /// </summary>
        /// <param name="context"></param>
        /// <param name="requirement"></param>
        /// <param name="resource"></param>
        /// <returns></returns>
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ResourceRequirement requirement, User? resource)
        {
            if (resource == null) return Task.CompletedTask;

            var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);


            if (context.User.IsInRole("ADMIN"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
            else
            {
                if (resource.Id == userId)
                {
                    context.Succeed(requirement);
                    return Task.CompletedTask;
                }

            }

            return Task.CompletedTask;
        }

        //protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ResourceRequirement requirement, User? resource)
        //{
        //    context.Succeed(requirement);

        //    return Task.CompletedTask;
        //}

    }
}
