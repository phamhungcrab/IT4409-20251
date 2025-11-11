using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Intrinsics.Arm;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Helpers
{
    internal class HashPasswordHelper
    {
        public static string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] pass = System.Text.Encoding.ASCII.GetBytes(password);
                byte[] hash_pass = sha256.ComputeHash(pass);
                return BitConverter.ToString(hash_pass);
            }
            

        }
    }
}
