using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.Auth
{
    public class RegisterDto
    {
        [EmailAddress]
        public required string Email {  get; set; }
        public required string Password { get; set; }
        public required string MSSV { get; set; }
        public UserRole Role { get; set; }
        public required string FullName { get; set; }
        public required DateTime DateOfBirth { get; set; }
        public string IpAdress { get; set; }
        public string UserAgent { get; set; }
        public string DeviceId { get; set; }
    }
}
