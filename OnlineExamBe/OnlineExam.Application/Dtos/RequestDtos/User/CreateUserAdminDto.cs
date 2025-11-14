using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.User
{
    public class CreateUserAdminDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public  DateTime DateOfBirth { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        public string? PasswordHash { get; set; }
        public  UserRole Role { get; set; }

    }
}
