using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.GroupPermissionDtos
{
    public class GroupPermissionSimpleDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }

        public GroupPermissionSimpleDto() { }
        public GroupPermissionSimpleDto(GroupPermission g)
        {
            Id = g.Id;
            Name = g.Name;
            Code = g.Code;
        }
    }
}
