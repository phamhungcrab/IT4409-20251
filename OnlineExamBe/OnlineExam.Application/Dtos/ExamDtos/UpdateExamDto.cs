using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class UpdateExamDto
    {
        public string Name { get; set; } = null!;

        public int BlueprintId { get; set; }

        public int ClassId { get; set; }

        public int DurationMinutes { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }
    }
}
