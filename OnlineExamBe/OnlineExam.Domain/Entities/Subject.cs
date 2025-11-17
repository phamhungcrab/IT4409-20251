using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class Subject
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string SubjectCode { get; set; }


        public ICollection<Class> Classes { get; set; } = new List<Class>();
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}
