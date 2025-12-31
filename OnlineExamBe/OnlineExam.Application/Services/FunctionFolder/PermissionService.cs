using Microsoft.EntityFrameworkCore.Metadata;
using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces.PermissionService;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace OnlineExam.Application.Services.PermissionFolder
{
    public class PermissionService : CrudService<Permission>, IPermissionService
    {
        private readonly IGroupPermissionService _groupPermissionService;
        public PermissionService(IRepository<Permission> repository,
                                IGroupPermissionService groupPermissionService) : base(repository)
        {
            _groupPermissionService = groupPermissionService;
        }

        public async Task<ResultApiModel> Create(CreatePermissionDto permission)
        {
            var checkExistCode = (await _repository.FindAsync(c => c.Code == permission.Code)).ToList();
            if (checkExistCode.Any()) 
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Trùng mã code chức năng"
                };
            }
            if(permission.GroupPermissionId != null)
            {

                var checkExistGroup = await _groupPermissionService.GetByIdAsync(permission.GroupPermissionId.Value);
                if (checkExistGroup == null) 
                {
                    return new ResultApiModel
                    {
                        Status = false,
                        MessageCode = ResponseCode.BadRequest,
                        Data = "Không có nhóm quyền này"
                    };

                }

            }

            var newItem = new Permission
            {
                Code = permission.Code,
                Name = permission.Name,
                GroupPermissionId = permission.GroupPermissionId,
                Index = permission.Index,
                
            };
            await CreateAsync(newItem);
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new PermissionDto(newItem)
            };
        }

        public async Task<ResultApiModel> GetByGroupIdAsync(int groupId)
        {
            var checkExist = await _groupPermissionService.GetByIdAsync(groupId);
            if(checkExist == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không có nhóm chức năng"
                };

            }
            var result = (await _repository.FindAsync(c => c.GroupPermissionId == groupId, "GroupPermission"))
                                            .Select(c => new PermissionDto(c))
                                            .ToList();
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = result
            };

        }

        public async Task<ResultApiModel> GetByCode(string code)
        {
            var per = (await _repository.FindAsync(c => c.Code == code, "GroupPermission"))
                                            .Select(c => new PermissionDto(c))
                                            .ToList();
            if (per == null) return null;
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = per
            };

        }
        public async Task<ResultApiModel> Update(UpdatePermissionDto update)
        {
            Permission checkExist= (await _repository.FindAsync(c => c.Id == update.Id)).FirstOrDefault();
            if (checkExist == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tồn tại Id"
                };
            }
            var checkExistCode = (await _repository.FindAsync(c => c.Code == update.Code)).ToList();
            if (checkExistCode.Any())
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Trùng mã code chức năng"
                };
            }
            if (update.GroupPermissionId != null)
            {

                var checkExistGroup = await _groupPermissionService.GetByIdAsync(update.GroupPermissionId.Value);
                if (checkExistGroup == null)
                {
                    return new ResultApiModel
                    {
                        Status = false,
                        MessageCode = ResponseCode.BadRequest,
                        Data = "Không có nhóm quyền này"
                    };

                }

            }

            checkExist.Code = update.Code;
            checkExist.Name = update.Name;
            checkExist.Index = update.Index;
            checkExist.GroupPermissionId = update.GroupPermissionId;
            await UpdateAsync(checkExist);
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new PermissionDto(checkExist)
            };

        }
    }
}
