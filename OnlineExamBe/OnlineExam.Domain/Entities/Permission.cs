using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class Permission
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int Index { get; set; }
        public int? GroupPermissionId { get; set; } = null;

        public GroupPermission? GroupPermission { get; set; } = null;
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public ICollection<UserPermission> UserPermissions { get; set; }  = new List<UserPermission>();
    }
}
