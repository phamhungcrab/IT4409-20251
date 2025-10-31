using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.Auth
{
    internal class LoginDto
    {
        public string Email {  get; set; }
        public string Password { get; set; }
        public string IpAdress {  get; set; }
        public string UserAgent { get; set; }
        public string DeviceId { get; set; }
        
        
    }
}
