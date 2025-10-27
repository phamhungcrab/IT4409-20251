using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Wise.Domain.Entities
{
    public class Vocabulary
    {
        public int Id { get; set; }

        public int LessonId { get; set; }
        public string Word { get; set; } = "";
        public string Meaning { get; set; } = "";
        public string Example { get; set; } = "";
        public string AudioUrl { get; set; } = "";

        // Navigation
        public Lesson? Lesson { get; set; }
    }
}
