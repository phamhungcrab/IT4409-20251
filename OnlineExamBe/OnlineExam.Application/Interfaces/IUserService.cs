
using OnlineExam.Application.Dtos.RequestDtos.User;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface IUserService : ICrudService<User>
    {
        //Kế thừa các phương thức chung 
        //Phuong thuc riêng đối với user Task<IEnumerable<T>> GetAllAsync();
        public Task<ResultApiModel>  CreateUsersAsync (CreateUserAdminDto[] user);
        public Task<ResultApiModel> CreateAsync(CreateUserAdminDto user);
        public Task<ResultApiModel> UpdateAsync(CreateUserAdminDto user);
        public Task<User> GetUserByEmail(string email); 
        public Task<ResultApiModel> UserUpdateAsync(UserUpdateDto userUpdate);
    }
}
