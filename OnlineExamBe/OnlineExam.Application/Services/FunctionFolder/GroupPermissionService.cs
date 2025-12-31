using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces.PermissionService;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OnlineExam.Application.Dtos.GroupPermissionDtos;

namespace OnlineExam.Application.Services.PermissionService
{
    public class GroupPermissionService : CrudService<GroupPermission>, IGroupPermissionService

    {
        public GroupPermissionService(Domain.Interfaces.IRepository<GroupPermission> repository) : base(repository)
        {
        }

        public async Task<ResultApiModel> Create(CreateGroupPermissionDto permission)
        {
            var checkExistCode = (await _repository.FindAsync(c => c.Code == permission.Code)).ToList();
            if (checkExistCode.Any())
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Trùng mã code nhóm chức năng"
                };
            }


            var newItem = new GroupPermission
            {
                Code = permission.Code,
                Name = permission.Name,

            };
            await CreateAsync(newItem);
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new GroupPermissionSimpleDto(newItem)
            };
        }

        public async Task<ResultApiModel> Update(UpdateGroupPermissionDto update)
        {
            var checkExist = await _repository.GetByIdAsync(update.Id);
            if (checkExist == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tồn tại nhóm"
                };
            }


            var newItem = new GroupPermission
            {
                Code = update.Code,
                Name = update.Name,

            };
            await UpdateAsync(newItem); 
            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new GroupPermissionSimpleDto(newItem)
            };
        }
    }
}
