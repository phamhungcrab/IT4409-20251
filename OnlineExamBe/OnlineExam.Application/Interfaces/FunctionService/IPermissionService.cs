using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.PermissionService
{
    public interface IPermissionService : ICrudService<Permission> 
    {
      public Task<ResultApiModel> GetByGroupIdAsync(int groupId);
        public Task<ResultApiModel> GetByCode(string code);
        public Task<ResultApiModel> Create(CreatePermissionDto permission);
        public Task<ResultApiModel> Update(UpdatePermissionDto update);

    }
}
