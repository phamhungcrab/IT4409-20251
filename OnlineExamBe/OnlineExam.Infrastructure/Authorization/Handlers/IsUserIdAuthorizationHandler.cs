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
    /// <summary>
    /// kiem tra Id cua user
    /// </summary>
    public class IsUserIdAuthorizationHandler : AuthorizationHandler<ResourceRequirement, int>
    {

        /// <summary>
        /// chi chap nhan neu user thuoc quyen so huu
        /// </summary>
        /// <param name="context"></param>
        /// <param name="requirement"></param>
        /// <param name="resource"></param>
        /// <returns></returns>
        //protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ResourceRequirement requirement, int resource)
        //{


        //    var userId = int.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);


        //    if (context.User.IsInRole("ADMIN"))
        //    {
        //        context.Succeed(requirement);
        //        return Task.CompletedTask;
        //    }
        //    else
        //    {
        //        if(resource == userId)
        //        {
        //            context.Succeed(requirement);
        //            return Task.CompletedTask;
        //        }

        //    }

        //    return Task.CompletedTask;
        //}

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ResourceRequirement requirement, int resource)
        {


            context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }
}
