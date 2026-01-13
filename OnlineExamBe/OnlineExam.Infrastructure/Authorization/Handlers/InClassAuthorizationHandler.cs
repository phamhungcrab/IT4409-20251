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
    public class InClassAuthorizationHandler : AuthorizationHandler<ResourceRequirement, Class>
    {

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ResourceRequirement requirement, Class? resource)
        {
            if (resource == null) return Task.CompletedTask;

            var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);


            if (context.User.IsInRole("ADMIN"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            if (context.User.IsInRole("TEACHER"))
            {
                if (resource.TeacherId == userId)
                {
                    context.Succeed(requirement);
                    return Task.CompletedTask;
                }
            }

            if (context.User.IsInRole("STUDENT"))
            {

                if ((requirement.Action == ResourceAction.ViewDetail || requirement.Action == ResourceAction.View || requirement.Action == ResourceAction.StartExam) && resource.StudentClasses.Any(s => s.StudentId == userId))
                    context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }

        //protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ResourceRequirement requirement, Class? resource)
        //{
        //    context.Succeed(requirement);

        //    return Task.CompletedTask;
        //}
    }
}
