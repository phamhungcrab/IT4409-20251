using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.WebSocket
{
    public class WsMessageDto
    {
        public WebsocketAction Action { get; set; }
        public int Order { get; set; }
        public int QuestionId { get; set; }
        public string Answer { get; set; } = string.Empty;
        //public int TimeSpent { get; set; }
    }
}
