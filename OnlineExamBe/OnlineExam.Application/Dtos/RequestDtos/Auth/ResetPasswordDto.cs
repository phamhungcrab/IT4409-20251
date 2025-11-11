using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.Auth
{
    public class ResetPasswordDto
    {
        [EmailAddress]
        public string Email {  get; set; }
        public string NewPassword { get; set; }
        public int Otp { get; set; }
    }
}
