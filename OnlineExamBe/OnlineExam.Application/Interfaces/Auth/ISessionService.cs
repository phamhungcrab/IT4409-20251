using Microsoft.IdentityModel.Tokens;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces.Auth
{

    public interface ISessionService
    {
        public Task<Session?> GetBySessionStringAsync(string sessionString);
        public Task<Session> CreateAsync(User user, int expireAfter);
        public Task<bool> DeleteByUserIdAsync(int userId);
        public Task<bool> DeleteAsync(string sessionString);
        public Task<bool> ValidateSession(string sessionString, UserRole? userRole = null, int? userId = null);

    }
}
