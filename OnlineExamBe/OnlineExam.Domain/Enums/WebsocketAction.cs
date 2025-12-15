using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Enums
{
    public enum WebsocketAction
    {
        SubmitAnswer,
        SubmitExam,
        Heartbeat,      // ping giữ kết nối
        SyncState,      // FE xin BE gửi lại cache
        ForceSubmit,    // BE ép nộp khi hết thời gian
        StartExam,      // trạng thái bắt đầu
        Reconnect       // FE reload trang xin vào lại
    }
}
