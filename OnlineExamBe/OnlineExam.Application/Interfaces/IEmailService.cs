using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendMail(string email, string code);
    }
}
