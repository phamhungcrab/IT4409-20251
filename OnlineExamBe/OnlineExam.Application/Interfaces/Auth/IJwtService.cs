using Microsoft.IdentityModel.Tokens;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.Auth
{
    public interface IJwtService
    {
        public string GenerateAccessToken(User user, int expireAfter, string deviceId, string ipAddress, string userAgent);
        public Task<RefreshToken> generateRefreshToken(User user, int expireAfter, string deviceId, string ipAddress, string userAgent);
    }
}
