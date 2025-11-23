using OnlineExam.Application.Dtos.WebSocket;
using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Domain.Enums;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace OnlineExam.Middleware
{
    public class ExamWebSocketMiddleware
    {
        private readonly RequestDelegate _next;
        public ExamWebSocketMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync( HttpContext context , IExamAnswerCache cache)
        {
            if (!context.WebSockets.IsWebSocketRequest)
            {
                await _next(context);
                return;
            }

            string connectionId = Guid.NewGuid().ToString();

            // Lấy examId + studentId từ query string
            if (!int.TryParse(context.Request.Query["examId"], out int examId) ||
                !int.TryParse(context.Request.Query["studentId"], out int studentId))
            {
                context.Response.StatusCode = 400;
                return;
            }

            using WebSocket socket = await context.WebSockets.AcceptWebSocketAsync();

            await ListenLoop(socket, examId, studentId, cache);

        }

        private async Task ListenLoop( WebSocket socket, int examId, int studentId, IExamAnswerCache cache)
        {
            var buffer = new byte[4096];

            try
            {
                while (socket.State == WebSocketState.Open)
                {
                    var result = await socket.ReceiveAsync(buffer, CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Close) break;

                    var json = Encoding.UTF8.GetString(buffer, 0, result.Count);

                    WsMessageDto? msg = JsonSerializer.Deserialize<WsMessageDto>(json);
                    if (msg == null) continue;

                    switch (msg.Action)
                    {
                        case WebsocketAction.SubmitAnswer:
                            cache.SaveAnswer(examId, studentId, msg.Order, msg.QuestionId, msg.Answer);
                            break;

                        case WebsocketAction.SubmitExam:
                            await HandleSubmitExam(socket, examId, studentId, cache);
                            return;

                        case WebsocketAction.SyncState:
                            await HandleSync(socket, examId, studentId, cache);
                            break;

                        case WebsocketAction.Heartbeat:
                            // giữ kết nối, không làm gì
                            break;

                        case WebsocketAction.Reconnect:
                            await HandleSync(socket, examId, studentId, cache);
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
            finally
            {

                if (socket.State != WebSocketState.Closed &&
                    socket.State != WebSocketState.Aborted)
                {
                    await socket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "Closed",
                        CancellationToken.None);
                }
            }
            
        }

        private async Task HandleSync(WebSocket socket, int examId, int studentId, IExamAnswerCache cache)
        {
            var answers = cache.GetAnswers(examId, studentId);

            var data = JsonSerializer.Serialize(answers);
            var bytes = Encoding.UTF8.GetBytes(data);

            await socket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task HandleSubmitExam(WebSocket socket, int examId, int studentId, IExamAnswerCache cache)
        {
            var answers = cache.GetAnswers(examId, studentId);

            //Lưu db + chấm
            //Submit

            cache.Clear(examId, studentId);

            var msg = Encoding.UTF8.GetBytes("{\"status\":\"submitted\"}");

            await socket.SendAsync(msg, WebSocketMessageType.Text, true, CancellationToken.None);

            //Đóng kết nối
            await socket.CloseAsync(
                WebSocketCloseStatus.NormalClosure,
                "Exam submitted",
                CancellationToken.None
            );
        }
    }
}
