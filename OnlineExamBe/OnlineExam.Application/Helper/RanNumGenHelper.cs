using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Helper
{
    public class RanNumGenHelper
    {
        public static string generateRandomString(int len)
        {
            byte[] bytes = new byte[len];
            RandomNumberGenerator.Fill(bytes);
            var sessionId = Convert.ToBase64String(bytes);
            return sessionId;
        }
    }
}
