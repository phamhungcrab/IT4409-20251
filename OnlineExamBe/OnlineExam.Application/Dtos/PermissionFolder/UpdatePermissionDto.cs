using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.PermissionFolder

{
    public class UpdatePermissionDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int Index { get; set; }
        public int? GroupPermissionId { get; set; } = null;
    }
}
