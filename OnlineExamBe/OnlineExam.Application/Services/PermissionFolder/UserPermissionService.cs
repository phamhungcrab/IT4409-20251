using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces.PermissionFolder;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services.PermissionFolder
{
    public class UserPermissionService : CrudService<UserPermission>, IUserPermissionService
    {
        public UserPermissionService(IRepository<UserPermission> repository) : base(repository)
        {
        }

        public async Task<List<PermissionDto>> GetUserPermission(int userId)
        {

            var userPermission = new List<PermissionDto>();
            userPermission = (await _repository.Query()
                                    .Where(x => x.UserId == userId)
                                    .Include("Permission").ToListAsync())
                                    .Select(x => new PermissionDto(x.Permission))
                                    .ToList();
            
            return userPermission;

        }
    }
}
