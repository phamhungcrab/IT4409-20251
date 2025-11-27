using OnlineExam.Domain.Entities;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Application.Helper;
using OnlineExam.Domain.Enums;
using Microsoft.IdentityModel.Tokens;
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
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiresAfter)
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

        public async Task<Session?> ValidateSession(string sessionString, UserRole[]? userRoles = null )
        {
            var sessions = await _repository.FindAsync(c => c.SessionString == sessionString);

            if (!sessions.Any())
            {
                return null;
            }
            var session = sessions.First(); 

            if(!userRoles.IsNullOrEmpty() && !userRoles.Contains(session.UserRole))
            {
                return null;
            }

            if (session.ExpiresAt < DateTime.UtcNow) 
            { 
                return null;   
            }
            return session;
        }

    }
        
}
