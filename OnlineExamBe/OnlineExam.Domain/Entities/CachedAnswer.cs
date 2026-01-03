using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Entities
{
    public class CachedAnswer
    {
        public int Order { get; set; }          // Thứ tự câu
        public int QuestionId { get; set; }     // Id câu hỏi gốc
        public string Answer { get; set; } = "";
        //public int TimeSpent { get; set; }      // Thời gian làm câu
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
