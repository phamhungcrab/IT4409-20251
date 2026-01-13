using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamBlueprint
{
    public class ExamBlueprintDto
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TotalQuestions { get; set; }
        public List<ExamBlueprintChapterDto> Chapters { get; set; } = new();
    }

    public class ExamBlueprintChapterDto
    {
        public int Chapter { get; set; }
        public int EasyCount { get; set; }
        public int MediumCount { get; set; }
        public int HardCount { get; set; }
        public int VeryHardCount { get; set; }
    }

    public class ExamBlueprintListViewDto
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }

        // Subject info (bổ sung)
        public string SubjectName { get; set; } = "";
        public string SubjectCode { get; set; } = "";
        public int TotalChapters { get; set; }

        // Blueprint info
        public DateTime CreatedAt { get; set; }
        public int TotalQuestions { get; set; }
    }
}
