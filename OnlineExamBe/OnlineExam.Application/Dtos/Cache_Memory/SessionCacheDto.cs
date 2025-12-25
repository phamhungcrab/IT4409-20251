
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.Cache_Memory
{
    public class SessionCacheDto
    {
        public required string SessionString { get; set; }
        public int UserId { get; set; }
        public required string MSSV { get; set; }
        public required string FullName { get; set; }
        public required DateTime DateOfBirth { get; set; }
        [EmailAddress]
        public required string Email { get; set; }
        public required UserRole UserRole { get; set; }

        public List<Permission> UserPermission { get; set; }
        public List<string> UserPermissionCode { get; set; }
        public int SessionId { get; set; }

        public DateTime ExpiresAt { get; set; }
    }
}
