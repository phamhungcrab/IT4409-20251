using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.GroupPermissionDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.PermissionService
{
    public interface IGroupPermissionService : ICrudService<GroupPermission> 
    {
        public Task<ResultApiModel> Create(CreateGroupPermissionDto permission);
        public Task<ResultApiModel> Update(UpdateGroupPermissionDto update);
    }
}
