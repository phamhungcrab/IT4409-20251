using OnlineExam.Domain.Entities;
using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Application.Interfaces.Auth;

namespace OnlineExam.Application.Services.Auth
{
    
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;
        public JwtService(IConfiguration config)
        {
            
            _config = config;
        }

        /// <summary>
        /// Tao access token
        /// </summary>
        /// <param name="user"></param>
        /// <param name="expireAfter">Tinh tho phut</param>
        /// <returns></returns>
        public  string GenerateAccessToken(User user, int expiresAfter, string deviceId,string ipAddress, string userAgent)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var cred = new SigningCredentials(key,SecurityAlgorithms.HmacSha256);
            var claims = new Claim[]
            {
                new Claim(ClaimTypes.Sid, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role,user.Role.ToString()),
                new Claim("DeviceId", deviceId),
                new Claim("IpAddress",ipAddress),
                new Claim("UserAgent", userAgent),
                new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString())

            };
            
            var tokenDescriptor = new SecurityTokenDescriptor()
            {
                SigningCredentials = cred,
                Subject = new ClaimsIdentity(claims),
                IssuedAt = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(expiresAfter),


            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var accessToken = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(accessToken);    
            
        }
        /// <summary>
        /// Tao refresh token
        /// </summary>
        /// <param name="user"></param>
        /// <param name="expiresAftre">Tinh theo ngay</param>
        /// <returns></returns>
        public async Task<RefreshToken> generateRefreshToken(User user, int expiresAftre, string deviceId, string ipAddress, string userAgent) {
            var token =  new RefreshToken()
            {
                Token = Guid.NewGuid().ToString(),  
                UserId = user.Id,
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(expiresAftre),
                IsExpired = false,
                DeviceId = deviceId,
                IpAddress = ipAddress,  
                UserAgent = userAgent
            };
            return token;
        }

    }
        
}
