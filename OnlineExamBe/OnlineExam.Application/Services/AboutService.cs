using Microsoft.AspNetCore.Http;
using OnlineExam.Application.Dtos.About;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class AboutService : CrudService<User> , IAboutService
    {
        HttpContextAccessor _httpContextAccessor;
        public AboutService(Repository<User> repository,
                            HttpContextAccessor httpContextAccessor) : base(repository) 
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<AboutDto> GetAboutAsync()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(userId == null)
            {
                return null;
            }

            var user = await _repository.GetByIdAsync(int.Parse(userId));
            if (user == null) 
            {
                return null;
            }
            return new AboutDto
            {
                MSSV = user.MSSV,
                FullName = user.FullName,
                DateOfBirth = user.DateOfBirth,
                Email = user.Email,
                Role = user.Role,
            };

        }
    }
}
