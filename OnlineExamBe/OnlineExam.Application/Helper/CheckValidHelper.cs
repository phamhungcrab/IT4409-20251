using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Helpers
{
    public class CheckValidHelper
    {
        public static bool IsValiddMail(string emailAddress)
        {
            try
            {
                var email = new MailAddress(emailAddress);
                return email.Address == emailAddress.Trim();
            }
            catch
            {
                return false;
            }
        }

    }
}
