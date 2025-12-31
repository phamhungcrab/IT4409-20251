
using Microsoft.AspNetCore.Authorization;
using OnlineExam.Domain.Enums;


namespace OnlineExam.Infrastructure.Policy.Requirements
{
    public class ResourceRequirement : IAuthorizationRequirement
    {
        public ResourceAction Action { get; }
        public ResourceRequirement(ResourceAction action) => Action = action;
    }
}
