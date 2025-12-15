using OnlineExam.Application.Dtos.WebSocket;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Application.Services.Helpers;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Interfaces;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

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
                            var startUtc = examStudent.StartTime.Kind switch
                            {
                                DateTimeKind.Utc => examStudent.StartTime,
                                DateTimeKind.Local => examStudent.StartTime.ToUniversalTime(),
                                _ => DateTime.SpecifyKind(examStudent.StartTime, DateTimeKind.Utc)
                            };

                            var examEndUtc = exam.EndTime.Kind switch
                            {
                                DateTimeKind.Utc => exam.EndTime,
                                DateTimeKind.Local => exam.EndTime.ToUniversalTime(),
                                _ => DateTime.SpecifyKind(exam.EndTime, DateTimeKind.Utc)
                            };

                            var now = DateTime.UtcNow;
                            var durationSeconds = Math.Max(60, exam.DurationMinutes * 60); // tránh duration = 0 gây auto nộp
                            var endDeadline = MinDate(startUtc.AddSeconds(durationSeconds), examEndUtc);
                            var remainingTime = (int)(endDeadline - now).TotalSeconds;
                            if (remainingTime <= 0)
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
                                Converters = { new JsonStringEnumConverter() },
                                PropertyNameCaseInsensitive = true
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
                            try
                            {
                                using var scopeSubmit = _scopeFactory.CreateScope();
                                var studentQuestionRepo = scopeSubmit.ServiceProvider.GetRequiredService<IRepository<StudentQuestion>>();
                                var questionRepo = scopeSubmit.ServiceProvider.GetRequiredService<IRepository<Question>>();

                                var question = await questionRepo.GetByIdAsync(msg.QuestionId);
                                var rawAnswer = NormalizeIncomingAnswer(msg.Answer);
                                var normalized = AnswerParser.NormalizeStudentAnswer(
                                    rawAnswer,
                                    question?.Answer ?? string.Empty);

                                // Cache normalized for grading, DB l?u raw ?? truy v?t
                                cache.SaveAnswer(examId, studentId, msg.Order, msg.QuestionId, normalized);

                                var existing = await studentQuestionRepo.Query()
                                    .FirstOrDefaultAsync(x => x.ExamId == examId && x.StudentId == studentId && x.QuestionId == msg.QuestionId);

                                if (existing != null)
                                {
                                    existing.Answer = rawAnswer;
                                    existing.Result = 0; // chấm khi SubmitExam
                                    existing.CreatedAt = DateTime.Now;
                                    studentQuestionRepo.UpdateAsync(existing);
                                }
                                else
                                {
                                    await studentQuestionRepo.AddAsync(new StudentQuestion
                                    {
                                        ExamId = examId,
                                        StudentId = studentId,
                                        QuestionId = msg.QuestionId,
                                        Answer = rawAnswer,
                                        Result = 0,
                                        CreatedAt = DateTime.Now
                                    });
                                }
                                await studentQuestionRepo.SaveChangesAsync();
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Failed to persist answer: {ex}");
                            }

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

            var grade = await gradingService.GradeAndSaveAsync(examId, studentId);

            cache.Clear(examId, studentId);

            var msgBytes = Encoding.UTF8.GetBytes(
                JsonSerializer.Serialize(new { status = "submitted", score = grade.Score, maxScore = grade.MaxScore })
            );

            await socket.SendAsync(msgBytes, WebSocketMessageType.Text, true, CancellationToken.None);

            await socket.CloseAsync(
                WebSocketCloseStatus.NormalClosure,
                "Exam submitted",
                CancellationToken.None
            );
        }

        private static DateTime MinDate(DateTime a, DateTime b) => a <= b ? a : b;

        private static string NormalizeIncomingAnswer(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
            var trimmed = raw.Trim();

            // If FE ever sends JSON array like ["A","B"], convert to A|B
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        var parts = new List<string>();
                        foreach (var el in doc.RootElement.EnumerateArray())
                        {
                            var val = el.ToString().Trim();
                            if (!string.IsNullOrWhiteSpace(val)) parts.Add(val);
                        }
                        return string.Join("|", parts);
                    }
                }
                catch
                {
                    // fall through to raw return
                }
            }

            return trimmed;
        }
    }
}
