using OnlineExam.Domain.Entities;
using OnlineExam.Application.Interfaces.Auth;
using Microsoft.AspNetCore.Http;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Application.Helper;
using OnlineExam.Domain.Enums;
namespace OnlineExam.Application.Services.Auth
{
    
    public class SessionService : CrudService<Session>, ISessionService
    {
       
        public SessionService(IRepository<Session> repository) : base(repository)
        {
        }
        public async Task<Session?> GetBySessionStringAsync(string sessionString)
        {
            var session = await _repository.FindAsync(c => c.SessionString == sessionString);
            return session.FirstOrDefault();
        }
        /// <summary>
        /// Tao session moi. Neu con tai session cu thi xoa roi tao moi
        /// </summary>
        /// <param name="user"></param>
        /// <param name="expireAfter">Tinh tho phut</param>
        /// <returns></returns>
        public async Task<Session> CreateAsync(User user, int expiresAfter)
        {

            var session = new Session {
                SessionString = RanNumGenHelper.generateRandomString(256),
                UserId = user.Id,
                UserRole = user.Role,
                IssuedAt = DateTime.Now,
                ExpiresAt = DateTime.Now.AddMinutes(expiresAfter)
            };

            var oldSession = await _repository.FindAsync(c => c.UserId == user.Id);
            if (oldSession.Any()) 
            {
                await DeleteAsync(oldSession.First().Id);

            }

            await CreateAsync(session);
            return session;


        }

        public  async Task<bool> DeleteByUserIdAsync(int userId)
        {
            var session = await _repository.FindAsync(c => c.UserId == userId);
            if (session.Any())
            {
               await DeleteAsync(session.First().Id);
                return true;
            }

            return false;
        }

        public async Task<bool> DeleteAsync(string sessionString)
        {
            var session = await _repository.FindAsync(c => c.SessionString == sessionString);
            if (session.Any())
            {
                await DeleteAsync(session.First().Id);
                return true;
            }

            return false;
        }

        public async Task<bool> ValidateSession(string sessionString,UserRole? userRole = null,int? userId = null) 
        {
            var sessions = await _repository.FindAsync(c => c.SessionString == sessionString);

            if (!sessions.Any())
            {
                return false;
            }
            var session = sessions.First(); 
            if(userId!=null && session.UserId != userId)
            {
                return false;
            }
            if(userRole != null && session.UserRole != userRole)
            {
                return false;
            }

            if (session.ExpiresAt < DateTime.Now) 
            { 
                return false;   
            }
            return true;
        }

    }
        
}
