using Microsoft.AspNetCore.Http;
using OnlineExam.Application.Dtos.About;
using OnlineExam.Application.Dtos.Cache_Memory;
using OnlineExam.Application.Dtos.ResponseDtos;
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
    public class DashboardService : IDashboardService
    {
        public DashboardService(IRepository<User> repository,
                            IHttpContextAccessor httpContextAccessor,
                            IRoleService roleService,
                            IUserPermissionService userPermissionService) 
        {
            //_httpContextAccessor = httpContextAccessor;
            //_roleService = roleService;
            //_userPermissionService = userPermissionService;
        }

        public Task<ResultApiModel> GetInfo()
        {
            throw new NotImplementedException();
        }
    }
}
