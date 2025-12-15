using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.Auth
{
    public class LoginDto
    {
        [EmailAddress]
        public string Email {  get; set; }
        public string Password { get; set; }
        public string? IpAddress {  get; set; }
        public string? UserAgent { get; set; }
        public string? DeviceId { get; set; }


    }
}
