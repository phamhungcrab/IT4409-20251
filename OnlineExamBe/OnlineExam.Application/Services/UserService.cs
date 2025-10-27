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
    internal class UserService  : CrudService<User> , IUserService
    {
        public UserService(IRepository<User> repository) : base(repository) { }

        //Các phương thức của User
    }
}
