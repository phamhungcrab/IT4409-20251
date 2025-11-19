using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class ExamBlueprintChapter
    {
        public int Id { get; set; }
        public int BlueprintId { get; set; }
        public ExamBlueprint? Blueprint { get; set; }

        public int Chapter { get; set; }
        public int EasyCount { get; set; }
        public int MediumCount { get; set; }
        public int HardCount { get; set; }
        public int VeryHardCount { get; set; }

        public int TotalQuestions =>
            EasyCount + MediumCount + HardCount + VeryHardCount;
    }

}
