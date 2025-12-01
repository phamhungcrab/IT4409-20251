using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class Session
    {
        public int Id { get; set; }
        public int UserId {  get; set; }
        public UserRole UserRole { get; set; }
        public required string SessionString {  get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime ExpiresAt { get; set; }

        [JsonIgnore]
        public User? User { get; set; }

    }
}
