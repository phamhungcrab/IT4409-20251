
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.User
{
    public class UserUpdateDto
    {
        public required string FullName { get; set; }
        public required DateTime DateOfBirth { get; set; }
        [EmailAddress]
        public required string Email { get; set; }

    }
}
