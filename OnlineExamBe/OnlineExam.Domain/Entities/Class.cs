using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class Class
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public int TeacherId { get; set; }
        public int SubjectId { get; set; }

       
        public User Teacher { get; set; }
        
        public Subject Subject { get; set; }
        
        public ICollection<StudentClass> StudentClasses { get; set; } = new List<StudentClass>();
        
        public ICollection<Exam> Exams { get; set; } = new List<Exam>();
    }
}
