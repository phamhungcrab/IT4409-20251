using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.RequestDtos.Auth
{
    public class LogoutDto
    {
        public int UserId { get; set; }
        public string DeviceId {  get; set; }
        public string IpAddress { get; set; }
        public string UserAgent {  get; set; }
    }
}
