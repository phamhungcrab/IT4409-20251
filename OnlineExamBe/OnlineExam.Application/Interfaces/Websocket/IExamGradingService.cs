using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.Websocket
{
    public record GradeResult(float Score, float MaxScore);

    public interface IExamGradingService
    {
        Task<GradeResult> GradeAndSaveAsync(int examId, int studentId);
    }
}
