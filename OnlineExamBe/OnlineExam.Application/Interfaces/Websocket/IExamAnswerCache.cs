using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.Websocket
{
    public interface IExamAnswerCache
    {
        void SaveAnswer(int examId, int studentId, int order ,int questionId, string answer );
        IReadOnlyList<CachedAnswer> GetAnswers(int examId, int studentId);
        void Clear(int examId, int studentId);
    }
}
