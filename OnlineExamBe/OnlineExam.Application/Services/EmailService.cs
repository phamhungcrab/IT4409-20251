using OnlineExam.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class EmailService : IEmailService
    {
        /// <summary>
        /// Tam thoi chua trie khai
        /// </summary>
        /// <param name="toMails"></param>
        /// <param name="subject"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        public bool SendMail(string[] toMails, string subject, string body)
        {
            throw new NotImplementedException();
        }
    }
}
