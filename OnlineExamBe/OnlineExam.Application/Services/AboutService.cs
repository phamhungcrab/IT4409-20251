using Microsoft.AspNetCore.Http;
using OnlineExam.Application.Dtos.About;
using OnlineExam.Application.Dtos.Cache_Memory;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.PermissionFolder;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class AboutService : CrudService<User> , IAboutService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IRoleService _roleService;
        private IUserPermissionService _userPermissionService;  
        public AboutService(IRepository<User> repository,
                            IHttpContextAccessor httpContextAccessor,
                            IRoleService roleService,
                            IUserPermissionService userPermissionService) : base(repository) 
        {
            _httpContextAccessor = httpContextAccessor;
            _roleService = roleService;
            _userPermissionService = userPermissionService;
        }

        public AboutDto GetAboutAsync()
        {
            var session = _httpContextAccessor.HttpContext.Items["UserSession"] as SessionCacheDto;
            if (session == null) {
                return null;
            }
            return new AboutDto
            {

                MSSV = session.MSSV,
                FullName = session.FullName,
                DateOfBirth = session.DateOfBirth,
                Email = session.Email,
                Role = session.UserRole,
                UserPermission = session.UserPermission,
            };

        }
    }
}
