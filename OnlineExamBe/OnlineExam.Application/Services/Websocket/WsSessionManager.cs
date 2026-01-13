using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services.Websocket
{
    public class WsSessionManager
    {
        private readonly ConcurrentDictionary<(int examId, int userId), WsSession> _sessions
            = new();

        public bool TryGet((int examId, int userId) key, out WsSession session)
            => _sessions.TryGetValue(key, out session!);

        public bool TryAdd((int examId, int userId) key, WsSession session)
            => _sessions.TryAdd(key, session);

        public void UpdateHeartbeat((int examId, int userId) key)
        {
            if (_sessions.TryGetValue(key, out var session))
            {
                session.LastHeartbeat = DateTime.Now;
            }
        }

        public void Remove((int examId, int userId) key)
            => _sessions.TryRemove(key, out _);
    }
}
