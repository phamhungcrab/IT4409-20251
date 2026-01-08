using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.ExamDtos
{
    public class ExamResultSummaryDto
    {
        public int ExamId { get; set; }
        public int StudentId { get; set; }

        public int TotalQuestions { get; set; }
        public int CorrectCount { get; set; }

        public double TotalQuestionPoint { get; set; }   // Tổng điểm đề
        public double StudentEarnedPoint { get; set; }   // Tổng điểm làm được

        public float FinalScore { get; set; }            // Điểm thang 10 (làm tròn 0.5)

        /// <summary>
        /// Number of violation events recorded during the exam (for Teacher view).
        /// </summary>
        public int ViolationCount { get; set; }
    }

}
