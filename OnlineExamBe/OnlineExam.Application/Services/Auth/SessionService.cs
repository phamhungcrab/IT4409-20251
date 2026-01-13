using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using OnlineExam.Application.Dtos.Cache_Memory;
using OnlineExam.Application.Dtos.PermissionFolder;
using OnlineExam.Application.Helper;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Interfaces.PermissionFolder;
using OnlineExam.Application.Interfaces.PermissionService;
using OnlineExam.Application.Services.Base;
using OnlineExam.Application.Services.PermissionFolder;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
namespace OnlineExam.Application.Services.Auth
{
    
    public class SessionService : CrudService<Session>, ISessionService
    {
        private IMemoryCache _cache;
        IPermissionService _permissionService;
        private readonly IRoleService _roleService;
        private readonly IUserPermissionService _userPermissionService;
        public SessionService(IRepository<Session> repository,
                             IMemoryCache cache,
                             IPermissionService permissionService,
                             IRoleService roleService,
                             IUserPermissionService userPermissionService) : base(repository)
        {
            _cache = cache;
            _permissionService = permissionService;
            _roleService = roleService;
            _userPermissionService = userPermissionService;
        }


        public void Set(string key, object data, int minutes = 30)
        {
            key = HashPassword(key);
            _cache.Set(key, data, TimeSpan.FromMinutes(minutes));
        }

        public T? Get<T>(string key)
        {
            key = HashPassword(key);
            return _cache.TryGetValue(key, out T? value) ? value : default;
        }

        public async Task<Session?> GetBySessionStringAsync(string sessionString)
        {
            
            var session = await _repository.FindAsync(c => c.SessionString == HashPassword(sessionString));
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

            var session= new Session {
                SessionString = RanNumGenHelper.generateRandomString(256),
                UserId = user.Id,
                UserRole = user.Role,
                IssuedAt = DateTime.Now,
                ExpiresAt = DateTime.Now.AddMinutes(expiresAfter)
            };

            var oldSession = await _repository.FindAsync(c => c.UserId == user.Id);
            if (oldSession.Any()) 
            {
                await DeleteByUserIdAsync(user.Id);

            }
            var sessionString = session.SessionString;
            session.SessionString = HashPassword(sessionString);
            await CreateAsync(session);

            var listRolePer = await _roleService.GetPermissionByRole(user.Role) ?? Enumerable.Empty<PermissionDto>(); 
            var listSpecialPer = await _userPermissionService.GetUserPermission(user.Id) ?? Enumerable.Empty<PermissionDto>();
            var userPermission = new List<PermissionDto>(listSpecialPer);
            userPermission = userPermission.Union(listRolePer).ToList();

            var info = new SessionCacheDto
            {
                SessionString = session.SessionString,
                UserId = user.Id,
                UserRole = user.Role,
                Email = user.Email,
                DateOfBirth = user.DateOfBirth,
                FullName = user.FullName,
                MSSV = user.MSSV,
                ExpiresAt = session.ExpiresAt,
                SessionId = session.Id,
                UserPermission = userPermission,
                UserPermissionCode = userPermission.Select(c => c.Code).ToList()

            };
            session.SessionString = sessionString;
            Set(session.SessionString, info);
            
           
            return session;


        }

        public  async Task<bool> DeleteByUserIdAsync(int userId)
        {
            var session = await _repository.FindAsync(c => c.UserId == userId);
            _cache.Remove(session.First().SessionString);
            if (session.Any())
            {
               await DeleteAsync(session.First().Id);
                return true;
            }
            
            return false;
        }

        public async Task<bool> DeleteAsync(string sessionString)
        {
            _cache.Remove(HashPassword(sessionString));
            var session = await _repository.FindAsync(c => c.SessionString == HashPassword(sessionString));
            if (session.Any())
            {
                await DeleteAsync(session.First().Id);
                return true;
            }
            
            return false;
        }

        public async Task<SessionCacheDto?> ValidateSession(string sessionString, UserRole[]? userRoles = null )
        {
            
            var session = Get<SessionCacheDto>(sessionString);
            if (session == null)
            {
                return null;
            }

            if(!(userRoles == null || userRoles.Length ==0) && !userRoles.Contains(session.UserRole))
            {
                return null;
            }

            if (session.ExpiresAt < DateTime.Now) 
            { 
                return null;   
            }
            return session;
        }

        public async Task ExtendSessionAsync(string sessionString, int addMinutes = 30)
        {
            var session = Get<SessionCacheDto>(sessionString);
            if (session != null)
            {
                if(session.ExpiresAt > DateTime.Now)
                session!.ExpiresAt = DateTime.Now.AddMinutes(addMinutes);
                Set(sessionString, session);
            }
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes);
        }
    }
        
}
