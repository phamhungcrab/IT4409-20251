using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.UserDtos
{
    public class UserDto
    {
        public int Id { get; set; }
        public string MSSV { get; set; }
        public  string FullName { get; set; }
        public DateTime DateOfBirth { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        public UserRole Role { get; set; }

        public UserDto(User u)
        {
            Id = u.Id;
            MSSV = u.MSSV;
            FullName = u.FullName;
            DateOfBirth = u.DateOfBirth;
            Email = u.Email;
            Role = u.Role;
        }
    }

}
