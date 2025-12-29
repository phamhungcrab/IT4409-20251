using OnlineExam.Application.Dtos.GroupUser;
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
    public interface IRoleService : ICrudService<Role>
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="roleCode">UserRole</param>
        /// <returns></returns>
        public Task<List<Permission>> GetPermissionByRole(UserRole roleCode);
        public Task<List<Permission>> GetPermissionByRole(int roleId);
        public Task<ResultApiModel> AddRolePermission(int roleId, int permissionId);
        public Task<ResultApiModel> RemoveRolePermission(int roleId, int permissionId);
        public Task<ResultApiModel> RemveRolePermissionById(int rolePermissionId);


    }
}
