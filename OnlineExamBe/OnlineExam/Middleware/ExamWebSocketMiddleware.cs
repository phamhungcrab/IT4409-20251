using OnlineExam.Application.Dtos.WebSocket;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Domain.Enums;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OnlineExam.Middleware
{
    public class ExamWebSocketMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;
        public ExamWebSocketMiddleware(
            RequestDelegate next,
            IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _scopeFactory = scopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.Request.Path.StartsWithSegments("/ws"))
            {
                await _next(context);
                return;
            }

            if (!context.WebSockets.IsWebSocketRequest)
            {
                context.Response.StatusCode = 400;
                return;
            }

            if (!int.TryParse(context.Request.Query["examId"], out int examId) ||
                !int.TryParse(context.Request.Query["studentId"], out int studentId))
            {
                context.Response.StatusCode = 400;
                return;
            }

            using WebSocket socket = await context.WebSockets.AcceptWebSocketAsync(); 
            await ListenLoop(socket, examId, studentId);
        }

        private async Task ListenLoop(WebSocket socket, int examId, int studentId)
        {
            using var scope = _scopeFactory.CreateScope();
            var cache = scope.ServiceProvider.GetRequiredService<IExamAnswerCache>();
            var grading = scope.ServiceProvider.GetRequiredService<IExamGradingService>();
            var _examService = scope.ServiceProvider.GetService<IExamService>();
            // gui thong tin thoi gian cho fe. het tgian thi nop bai

            var sendTask = Task.Run(async () =>
            {
                try
                {
                    while (socket.State == WebSocketState.Open)
                    {
                        if (_examService != null)
                        {
                            var examStudent = await _examService.GetExamStudent(examId, studentId);
                            var exam = await _examService.GetByIdAsync(examId);
                            if (examStudent == null || exam == null)
                            {
                                var msgBytes = Encoding.UTF8.GetBytes(
                                JsonSerializer.Serialize(new { status = $"error : Không có bài thi cho sinh viên này {examId} : {studentId}" })
                                );
                                await socket.SendAsync(msgBytes, WebSocketMessageType.Text, true, CancellationToken.None);
                                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                                break;
                            }
                            var remainingTime = exam.DurationMinutes * 60 - (int)(DateTime.UtcNow - examStudent.StartTime).TotalSeconds;
                            if (remainingTime <= 0 || exam.EndTime <= DateTime.UtcNow)
                            {
                                await HandleSubmitExam(socket, examId, studentId);
                                break;
                            }
                            var bytes = Encoding.UTF8.GetBytes(remainingTime.ToString());
                            try
                            {
                                await socket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.ToString());
                            }

                            // 1 s gui 1 lan de cap nhat tgian
                            await Task.Delay(1000);

                        }
                        else
                        {
                            await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                            break;
                        }
                    }
                }
                catch(Exception ex) 
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
            });
            

            // nhan ycau tu fe de xu ly

            var receiveTask = Task.Run(async () => {

            var buffer = new byte[4096];
            try
            {

                while (socket.State == WebSocketState.Open)
                {
                    var result = await socket.ReceiveAsync(buffer, CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Close) break;

                    var json = Encoding.UTF8.GetString(buffer, 0, result.Count);


                    WsMessageDto? msg;
                    try
                    {
                        msg = JsonSerializer.Deserialize<WsMessageDto>(json,
                            new JsonSerializerOptions
                            {
                                Converters = { new JsonStringEnumConverter() }
                            });
                    }
                    catch
                    {
                        Console.WriteLine("Invalid JSON.");
                        continue;
                    }

                    if (msg == null) continue;

                    switch (msg.Action)
                    {
                        case WebsocketAction.SubmitAnswer:
                            cache.SaveAnswer(examId, studentId, msg.Order, msg.QuestionId, msg.Answer);

                            var msgBytes = Encoding.UTF8.GetBytes(
                                JsonSerializer.Serialize(new { status = "submitted answer id " + msg.QuestionId + " : " + msg.Answer})
                            );

                            await socket.SendAsync(msgBytes, WebSocketMessageType.Text, true, CancellationToken.None);
                            break;

                        case WebsocketAction.SubmitExam:
                            await HandleSubmitExam(socket, examId, studentId);
                            return;

                        case WebsocketAction.SyncState:
                        case WebsocketAction.Reconnect:
                            await HandleSync(socket, examId, studentId);
                            break;

                        case WebsocketAction.Heartbeat:
                            var ms = Encoding.UTF8.GetBytes(
                                JsonSerializer.Serialize(new { status = "Heartbeat"})
                            );

                            await socket.SendAsync(ms, WebSocketMessageType.Text, true, CancellationToken.None);
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

            });

            await Task.WhenAny(sendTask, receiveTask);

        }

        private async Task HandleSync(WebSocket socket, int examId, int studentId)
        {
            using var scope = _scopeFactory.CreateScope();
            var cache = scope.ServiceProvider.GetRequiredService<IExamAnswerCache>();

            var answers = cache.GetAnswers(examId, studentId);

            var bytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(answers));

            await socket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task HandleSubmitExam(WebSocket socket, int examId, int studentId)
        {
            using var scope = _scopeFactory.CreateScope();
            var cache = scope.ServiceProvider.GetRequiredService<IExamAnswerCache>();
            var gradingService = scope.ServiceProvider.GetRequiredService<IExamGradingService>();

            float score = await gradingService.GradeAndSaveAsync(examId, studentId);

            cache.Clear(examId, studentId);

            var msgBytes = Encoding.UTF8.GetBytes(
                JsonSerializer.Serialize(new { status = "submitted", score })
            );

            await socket.SendAsync(msgBytes, WebSocketMessageType.Text, true, CancellationToken.None);

            await socket.CloseAsync(
                WebSocketCloseStatus.NormalClosure,
                "Exam submitted",
                CancellationToken.None
            );
        }
    }
}
