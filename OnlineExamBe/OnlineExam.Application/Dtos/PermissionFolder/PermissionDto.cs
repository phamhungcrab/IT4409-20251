using OnlineExam.Application.Dtos.GroupPermissionDtos;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.PermissionFolder
{
    public class PermissionDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int Index { get; set; }
        public int? GroupPermissionId { get; set; } = null;

        public GroupPermissionSimpleDto? GroupPermission { get; set; } = null;
        public PermissionDto() { }
        public PermissionDto(Permission p)
        {
            Id = p.Id;
            Code = p.Code;
            Name = p.Name;
            Index = p.Index;
            GroupPermissionId = p.GroupPermissionId;
            if(p.GroupPermission != null)
            GroupPermission = new GroupPermissionSimpleDto(p.GroupPermission);
        }
      
    }
}
