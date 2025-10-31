using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.Auth
{
    internal class ResetPasswordDto
    {
        public string Email {  get; set; }
        public string NewPassword { get; set; }
        public int Otp { get; set; }
    }
}
