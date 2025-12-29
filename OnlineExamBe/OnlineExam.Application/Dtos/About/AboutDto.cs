using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.About
{
    public class AboutDto
    {
        public required string MSSV { get; set; }
        public required string FullName { get; set; }
        public required DateTime DateOfBirth { get; set; }
        [EmailAddress]
        public required string Email { get; set; }
        public required UserRole Role { get; set; }
        public List<Permission> UserPermission { get; set; }
    }
}
