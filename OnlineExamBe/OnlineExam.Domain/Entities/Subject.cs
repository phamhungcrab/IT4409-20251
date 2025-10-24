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


        public ICollection<Class> Classes { get; set; }
        public ICollection<Question> Questions { get; set; }
    }
}
