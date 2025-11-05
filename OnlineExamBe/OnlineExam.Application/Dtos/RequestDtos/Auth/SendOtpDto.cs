using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.Auth
{
    public class SendOtpDto
    {
        [EmailAddress]
        public required string Email { get; set; }
    }
}
