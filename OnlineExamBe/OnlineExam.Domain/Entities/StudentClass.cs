using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class StudentClass
    {
        public int StudentId { get; set; }
        public int ClassId { get; set; }

        [JsonIgnore]
        public User Student { get; set; }
        [JsonIgnore]
        public Class Class { get; set; }
    }
}
