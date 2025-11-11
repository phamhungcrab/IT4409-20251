using Microsoft.Extensions.Options;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Settings;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtp;
        public EmailService(IOptions<SmtpSettings> smtp)
        {
            _smtp = smtp.Value;
        }

        public async Task SendMail(string email, string code)
        {
            var client = new SmtpClient(_smtp.Host, _smtp.Port)
            {
                Credentials = new NetworkCredential(_smtp.Username, _smtp.Password),
                EnableSsl = _smtp.EnableSsl
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_smtp.Username, "Online Exam OTP"),
                Subject = $"Mã OTP xác thực của bạn",
                Body = $@"
                <html>
                  <body>
                    <h2 style='color:#007bff'>Mã OTP của bạn</h2>
                    <p>Xin chào,</p>
                    <p>Bạn đang thực hiện xác thực OTP trên hệ thống.</p>
                    <p>Mã OTP của bạn là: <b>{code}</b></p>
                    <p style='color:gray'>Hiệu lực trong 3 phút.</p>
                  </body>
                </html>",
                IsBodyHtml = true
            };
            mail.To.Add(email);

            await client.SendMailAsync(mail);

            Console.WriteLine($"[OTP SENT] {email} => {code}");
        }
    }
}
