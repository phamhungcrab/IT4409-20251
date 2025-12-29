using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.PermissionFolder
{
    public class CreatePermissionDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public int Index { get; set; }
        public int? GroupPermissionId { get; set; } = null;

    }
}
