using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.PermissionFolder
{
    public interface IUserPermissionService : ICrudService<UserPermission>
    {
        public Task<List<PermissionDto>> GetUserPermission(int userId);
    }
}
