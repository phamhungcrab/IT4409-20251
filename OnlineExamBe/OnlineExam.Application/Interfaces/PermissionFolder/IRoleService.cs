using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.RoleDtos;
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
        public Task<List<PermissionDto>?> GetPermissionByRole(UserRole roleCode);
        public Task<List<PermissionDto>> GetPermissionByRole(int roleId);
        public Task<ResultApiModel> AddRolePermission(int roleId, int permissionId);
        public Task<ResultApiModel> RemoveRolePermission(int roleId, int permissionId);
        public Task<ResultApiModel> RemveRolePermissionById(int rolePermissionId);
        public Task<ResultApiModel> Create(CreateRoleDto role);
        public Task<ResultApiModel> Update(CreateRoleDto update);


    }
}
