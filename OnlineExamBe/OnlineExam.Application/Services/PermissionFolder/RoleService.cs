using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.RoleDtos;
using OnlineExam.Application.Interfaces.PermissionFolder;
using OnlineExam.Application.Interfaces.PermissionService;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services.PermissionFolder
{
    public class RoleService : CrudService<Role>, IRoleService
    {
        private IPermissionService _permissionService;
        private IRepository<RolePermission> _rolePermissionRepo;
        public RoleService(IRepository<Role> repository
                        , IPermissionService permissionService
                        , IRepository<RolePermission> rolePermissionRepo) : base(repository)
        {
            _permissionService = permissionService;
            _rolePermissionRepo = rolePermissionRepo;
        }

        public async Task<ResultApiModel> AddRolePermission(int roleId, int permissionId)
        {
            var role = await GetByIdAsync(roleId);
            if (role == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không có role này"
                };

            }

            var permission = (await _permissionService.GetByIdAsync(permissionId));
            if (permission == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không có chức năng này"
                };
            }

            var checkExist = await _rolePermissionRepo.FindAsync(c => (c.RoleId == roleId) && (c.PermissionId == permissionId));
            if (checkExist.Any())
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Role đã tồn tại chức năng này"
                };
            }

            var newItem = new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId,
            };
            await _rolePermissionRepo.AddAsync(newItem);
            await _rolePermissionRepo.SaveChangesAsync();
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new
                {
                    Role = new RoleSimpleDto(role),
                    Permission = new  PermissionSimpleDto(permission)
                }
            };

        }

        public async Task<List<PermissionDto>> GetPermissionByRole(UserRole roleCode)
        {
            var checkRole = (await _repository.FindAsync(c => c.Code == roleCode)).FirstOrDefault();
            if (checkRole == null)
            {
                return null;
            }
            var result = new List<PermissionDto>();
            var test = await _rolePermissionRepo.Query().Where(c => c.RoleId == checkRole.Id).Include(c => c.Permission).ToListAsync();
            var test2 = test.Select(c => new PermissionDto(c.Permission)).ToList();
            result = (await _rolePermissionRepo.Query()
                                                  .Where(c => c.RoleId == checkRole.Id)
                                                  .Include(c => c.Permission).ToListAsync())
                                                  .Select(c => new PermissionDto(c.Permission)).ToList();
                                                  
            return result;
        }
        public async Task<List<PermissionDto>> GetPermissionByRole(int roleId)
        {

            var result = new List<PermissionDto>();
            result = (await _rolePermissionRepo.Query()
                                                  .Where(c => c.RoleId == roleId)
                                                  .Include(c => c.Permission).ToListAsync())
                                                  .Select(c =>new PermissionDto(c.Permission))
                                                  .ToList();
            
            return result;
        }
        public async Task<ResultApiModel> RemoveRolePermission(int roleId, int permissionId)
        {
            var checkRole = (await _rolePermissionRepo.FindAsync(c => c.RoleId == roleId && c.PermissionId == permissionId)).FirstOrDefault();
            if (checkRole == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Role không có quyền này"
                };
            }

            _rolePermissionRepo.DeleteAsync(checkRole);
            await _rolePermissionRepo.SaveChangesAsync();
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = "Xóa quyền thành công"

            };


        }

        public async Task<ResultApiModel> RemveRolePermissionById(int rolePermissionId)
        {
            var rolePermission = (await _rolePermissionRepo.FindAsync(c => c.Id == rolePermissionId)).FirstOrDefault();
            if (rolePermission == null) return new ResultApiModel
            {
                Status = false,
                MessageCode = ResponseCode.NotFound,
                Data = "Role không có chức năng này"
            };

            _rolePermissionRepo.DeleteAsync(rolePermission);
            await _rolePermissionRepo.SaveChangesAsync();

            return new ResultApiModel
            {
                Data = "Xóa thành công",
                MessageCode = ResponseCode.Success,
                Status = true,
            };

        }
        public async Task<ResultApiModel> Create(CreateRoleDto role)
        {
            var checkExistCode = (await _repository.FindAsync(c => c.Code == role.Code)).ToList();
            if (checkExistCode.Any())
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Trùng mã code role"
                };
            }


            var newItem = new Role
            {
                Code = role.Code,

            };
            await CreateAsync(newItem);
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new RoleSimpleDto(newItem)
            };
        }
        public async Task<ResultApiModel> Update(CreateRoleDto update)
        {
            var checkExistCode = (await _repository.FindAsync(c => c.Code == update.Code)).ToList();
            if (!checkExistCode.Any())
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tồn tại role"
                };
            }


            var role = checkExistCode.First();
            role.Code = update.Code;
            await UpdateAsync(role);
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new RoleSimpleDto(role)
            };
        }
    }
}
