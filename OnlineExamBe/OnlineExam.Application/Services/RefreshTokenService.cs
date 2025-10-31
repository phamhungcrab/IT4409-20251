using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    internal class RefreshTokenService : CrudService<RefreshToken>,IRefreshTokenService
    {
        private readonly IRepository<User> _userRepository;
        public RefreshTokenService(IRepository<RefreshToken> repository
                                , IRepository<User> userRepository
                                   ) : base(repository)
        {
            _userRepository = userRepository;
        }
       
    }
}
