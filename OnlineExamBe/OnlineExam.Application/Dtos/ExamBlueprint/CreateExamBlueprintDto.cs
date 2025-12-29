using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamBlueprint
{
    public class CreateExamBlueprintDto
    {
        public int SubjectId { get; set; }
        public required List<BlueprintChapterDto> Chapters { get; set; }
    }

    public class BlueprintChapterDto
    {
        public int Chapter { get; set; }
        public int EasyCount { get; set; }
        public int MediumCount { get; set; }
        public int HardCount { get; set; }
        public int VeryHardCount { get; set; }
    }
}
