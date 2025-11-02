using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public int UserId {  get; set; }
        public string Token { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsExpired { get; set; } = false;
        public string DeviceId {  get; set; }
        public string UserAgent { get; set; }
        public string IpAddress {get; set;}
        
        public User User { get; set; }

    }
}
