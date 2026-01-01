using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class SearchExamDto : SearchBaseDto
    {
        public string? Name { get; set; }

        // thời gian mở đề (window)
        // filter pham vi thoi gian bat dau exam
        public DateTime? StartTimeFrom { get; set; }
        public DateTime? StartTimeTo { get; set; }
        // ket thuc exam
        public DateTime? EndTimeFrom { get; set; }
        public DateTime? EndTimeTo { get; set; }



    }
}
