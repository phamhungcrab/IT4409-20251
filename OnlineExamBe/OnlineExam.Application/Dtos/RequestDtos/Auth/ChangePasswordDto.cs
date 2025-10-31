using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.Auth
{
    internal class ChangePasswordDto
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
        public string OldPassword {  get; set; }



    }
}
