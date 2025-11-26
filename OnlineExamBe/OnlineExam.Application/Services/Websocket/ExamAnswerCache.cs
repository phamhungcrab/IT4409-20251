using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services.Websocket
{
    public class ExamAnswerCache : IExamAnswerCache
    {
        private readonly ConcurrentDictionary<string, string> _examStudentToConnection = new();
        private readonly ConcurrentDictionary<string, List<CachedAnswer>> _connectionToAnswers = new();

        private string BuildKey(int examId, int studentId)
            => $"{examId}_{studentId}";

        private string EnsureConnection(int examId, int studentId)
        {
            var key = BuildKey(examId, studentId);

            return _examStudentToConnection.GetOrAdd(key, _ =>
            {
                var newConn = Guid.NewGuid().ToString("N");
                _connectionToAnswers[newConn] = new List<CachedAnswer>();
                return newConn;
            });
        }

        public void SaveAnswer(int examId, int studentId, int order, int questionId, string answer)
        {
            var connectionId = EnsureConnection(examId, studentId);

            var list = _connectionToAnswers.GetOrAdd(connectionId, _ => new List<CachedAnswer>());

            lock (list) // tránh conflict khi nhiều gói gửi cùng lúc
            {
                var existing = list.FirstOrDefault(a => a.Order == order);
                if (existing != null)
                {
                    // update
                    existing.Answer = answer;
                    existing.QuestionId = questionId;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    list.Add(new CachedAnswer
                    {
                        Order = order,
                        QuestionId = questionId,
                        Answer = answer,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        public IReadOnlyList<CachedAnswer> GetAnswers(int examId, int studentId)
        {
            var key = BuildKey(examId, studentId);

            if (_examStudentToConnection.TryGetValue(key, out var connectionId) &&
                _connectionToAnswers.TryGetValue(connectionId, out var list))
            {
                lock (list)
                {
                    return list
                        .OrderBy(a => a.Order)
                        .ToList()
                        .AsReadOnly();
                }
            }

            return Array.Empty<CachedAnswer>();
        }

        public void Clear(int examId, int studentId)
        {
            var key = BuildKey(examId, studentId);

            if (_examStudentToConnection.TryRemove(key, out var connectionId))
            {
                _connectionToAnswers.TryRemove(connectionId, out _);
            }
        }
    }
}
