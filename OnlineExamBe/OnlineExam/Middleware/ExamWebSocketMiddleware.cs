using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.WebSocket;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Application.Services.Websocket;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System.Net.WebSockets;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OnlineExam.Middleware
{
    public class ExamWebSocketMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly WsSessionManager _sessionManager;

        // Use relaxed escaping to prevent unicode characters like Vietnamese from being escaped (e.g. \u1ECDi -> ọi)
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        public ExamWebSocketMiddleware(
            RequestDelegate next,
            IServiceScopeFactory scopeFactory,
            WsSessionManager sessionManager)
        {
            _next = next;
            _scopeFactory = scopeFactory;
            _sessionManager = sessionManager;
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

            var key = (examId, studentId);

            if (_sessionManager.TryGet(key, out var existing))
            {
                var diff = DateTime.Now - existing.LastHeartbeat;

                if (diff <= TimeSpan.FromSeconds(60))
                {
                    context.Response.StatusCode = StatusCodes.Status409Conflict;
                    await context.Response.WriteAsync("ALREADY_CONNECTED");
                    return;
                }

                // quá timeout → cho reconnect
                _sessionManager.Remove(key);
            }

            using WebSocket socket = await context.WebSockets.AcceptWebSocketAsync();

            _sessionManager.TryAdd(
                (examId, studentId),
                new WsSession
                {
                    Socket = socket,
                    LastHeartbeat = DateTime.Now
                }
            );
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
                                JsonSerializer.Serialize(new { status = $"error : Không có bài thi cho sinh viên này {examId} : {studentId}" }, _jsonOptions)
                                );
                                await socket.SendAsync(msgBytes, WebSocketMessageType.Text, true, CancellationToken.None);
                                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                                break;
                            }
                            var remainingTime = exam.DurationMinutes * 60 - (int)(DateTime.Now - examStudent.StartTime).TotalSeconds;
                            if (remainingTime <= 0 || exam.EndTime <= DateTime.Now)
                            {
                                // Hết giờ -> Tự động nộp
                                await HandleSubmitExam(socket, examId, studentId);
                                break;
                            }

                            // Check nếu bài thi đã bị nộp (Force Submit bởi Teacher)
                            if (examStudent.Status == ExamStatus.COMPLETED)
                            {
                                var msgBytes = Encoding.UTF8.GetBytes(
                                    JsonSerializer.Serialize(new {
                                        status = "force_submitted",
                                        reason = "Bài thi đã được thu bởi giáo viên"
                                    }, _jsonOptions)
                                );
                                await socket.SendAsync(msgBytes, WebSocketMessageType.Text, true, CancellationToken.None);
                                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Force submitted", CancellationToken.None);
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
                            await HandleSubmitAnswer(
                                socket,
                                examId,
                                studentId,
                                msg
                            );
                            break;

                        case WebsocketAction.SubmitExam:
                        await HandleSubmitExam(socket, examId, studentId);
                        return;

                        case WebsocketAction.SyncState:
                        case WebsocketAction.Reconnect:
                            await HandleSync(socket, examId, studentId);
                            break;

                        case WebsocketAction.Heartbeat:
                                _sessionManager.UpdateHeartbeat((examId, studentId));
                                var ms = Encoding.UTF8.GetBytes(
                                JsonSerializer.Serialize(new { status = "Heartbeat"}, _jsonOptions)
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
                    _sessionManager.Remove((examId, studentId));
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
        private async Task HandleSubmitAnswer( WebSocket socket, int examId, int studentId, WsMessageDto msg)
        {
            using var scope = _scopeFactory.CreateScope();

            var cache = scope.ServiceProvider.GetRequiredService<IExamAnswerCache>();
            var examStudentRepo = scope.ServiceProvider.GetRequiredService<IRepository<ExamStudent>>();

            var state = await examStudentRepo.Query()
                .FirstOrDefaultAsync(x =>
                    x.ExamId == examId &&
                    x.StudentId == studentId);

            if (state == null)
            {
                await SendWsError(socket, "EXAM_NOT_FOUND", "Bài thi không tồn tại");
                return;
            }

            if (state.Status == ExamStatus.COMPLETED)
            {
                // Nếu đã completed (có thể do force submit), gửi lại message force_submitted
                var msgBytes = Encoding.UTF8.GetBytes(
                    JsonSerializer.Serialize(new {
                        status = "force_submitted",
                        reason = "Bài thi đã được thu bởi giáo viên"
                    }, _jsonOptions)
                );
                await socket.SendAsync(msgBytes, WebSocketMessageType.Text, true, CancellationToken.None);
                return;
            }

            if (state.Status != ExamStatus.IN_PROGRESS)
            {
                await SendWsError(socket, "EXAM_CLOSED", "Bài thi đã kết thúc");
                return;
            }

            if (!msg.Order.HasValue || msg.Order <= 0)
            {
                await SendWsError(socket,
                    "INVALID_ORDER",
                    "Order là bắt buộc và phải > 0");
                return;
            }

            if (msg.QuestionId <= 0)
            {
                await SendWsError(socket,
                    "INVALID_QUESTION",
                    "QuestionId không hợp lệ");
                return;
            }

            if (string.IsNullOrWhiteSpace(msg.Answer))
            {
                await SendWsError(socket,
                    "EMPTY_ANSWER",
                    "Answer không được để trống");
                return;
            }

            cache.SaveAnswer( examId, studentId, msg.Order.Value, msg.QuestionId, msg.Answer);

            await socket.SendAsync(
                Encoding.UTF8.GetBytes(
                    JsonSerializer.Serialize(new
                    {
                        status = "submitted",
                        order = msg.Order,
                        questionId = msg.QuestionId,
                        address = "", // Placeholder
                        answer = msg.Answer
                    }, _jsonOptions)
                ),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }

        private async Task HandleSync(WebSocket socket, int examId, int studentId)
        {
            using var scope = _scopeFactory.CreateScope();
            var cache = scope.ServiceProvider.GetRequiredService<IExamAnswerCache>();

            var answers = cache.GetAnswers(examId, studentId);

            var bytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(answers, _jsonOptions));

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
                JsonSerializer.Serialize(new { status = "submitted"}, _jsonOptions)
            );

            await socket.SendAsync(msgBytes, WebSocketMessageType.Text, true, CancellationToken.None);

            await socket.CloseAsync(
                WebSocketCloseStatus.NormalClosure,
                "Exam submitted",
                CancellationToken.None
            );
        }

        private async Task SendWsError( WebSocket socket, string code, string message)
        {
            var payload = JsonSerializer.Serialize(new
            {
                status = "error",
                code,
                message
            }, _jsonOptions);

            await socket.SendAsync(
                Encoding.UTF8.GetBytes(payload),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }

    }
}
