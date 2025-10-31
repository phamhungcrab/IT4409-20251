using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    internal interface IEmailService
    {
        public bool SendMail(string[] toMails, string subject, string body);
    }
}
