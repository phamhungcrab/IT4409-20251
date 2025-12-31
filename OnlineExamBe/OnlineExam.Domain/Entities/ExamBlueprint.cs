using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class ExamBlueprint
    {
        public int Id { get; set; }

        public int SubjectId { get; set; }
        public Subject? Subject { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<ExamBlueprintChapter>? Chapters { get; set; } = [];
    }
}
