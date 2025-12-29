using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.UserDtos
{
    public class CreateUserAdminDto
    {
        public required string FullName { get; set; }
        public  DateTime DateOfBirth { get; set; }
        public required string MSSV { get; set; }
        [EmailAddress]
        public required string Email { get; set; }
        public required string Password { get; set; }
        public UserRole Role { get; set; } = UserRole.STUDENT;

    }
}
