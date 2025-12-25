using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OnlineExam.Application.Dtos.PermissionFolder;

namespace OnlineExam.Application.Dtos.GroupPermissionDtos
{
    public class GroupPermissionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public ICollection<PermissionSimpleDto> ListChildPermission { get; set; } = new List<PermissionSimpleDto>();
        public GroupPermissionDto() { }
        public GroupPermissionDto(GroupPermission g)
        {
            Id = g.Id;
            Name = g.Name;
            Code = g.Code;
            ListChildPermission = g.ListChildPermission.Select(p => new PermissionSimpleDto(p)).ToList();
        }

        
    }
}
