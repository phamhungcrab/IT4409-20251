using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RoleDtos
{
    public  class RoleSimpleDto
    {
        public int Id { get; set; }
        public string Name => Code.ToString();
        public UserRole Code { get; set; }
        public RoleSimpleDto() { }
        public RoleSimpleDto(Role r)
        {
            Id = r.Id;
            Code = r.Code;
        }

    }
}
