using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class ExamSimpleDto
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // thời gian mở đề (window)
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        // thời lượng làm bài
        public int DurationMinutes { get; set; } = 30;

        public int? BlueprintId { get; set; }
        public ExamSimpleDto(Exam e)
        {
            Id = e.Id;
            Name = e.Name;
            StartTime = e.StartTime;
            EndTime = e.EndTime;
            DurationMinutes = e.DurationMinutes;
            BlueprintId = e.BlueprintId;
        }
    }
}
