using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamBlueprint
{
    public class ExamWithBlueprintSimpleDto
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; } = "";

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public int? BlueprintId { get; set; }
        public DateTime? BlueprintCreatedAt { get; set; }
    }
}
