using OnlineExam.Application.Dtos.ReponseDtos;
using OnlineExam.Application.Dtos.RequestDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    internal class UserService : CrudService<User>, IUserService
    {
        public UserService(IRepository<User> repository) : base(repository)
        {
        }
        #region Admin
        // ke thua tu crud
        #endregion

        #region User

        //Các phương thức của User
        public async Task<ResultApiModel> CreateAsync(User user)
        {
            if (user.Email == null ) 
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Thieu Email"
                };
            }
            var checkMail = await _repository.FindAsync(x => x.Email.ToLower().Equals(user.Email.ToLower()));
            if (checkMail != null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Da ton tai email nay"
                };
            }
            
            else
            {
                await base.CreateAsync(user);
                return new ResultApiModel()
                {
                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = "Tao user thanh cong"

                };
            }
        }
        public async Task<ResultApiModel> UpdateAsync(User user)
        {

            if (user.Email == null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Thieu Email"
                };
            }
            var checkMail = await _repository.FindAsync(x => x.Email.ToLower().Equals(user.Email.ToLower()));
            if (checkMail != null)
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Da ton tai email nay"
                };
            }
            else
            {
                await base.UpdateAsync(user);
                return new ResultApiModel()
                {
                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = "Cap nhat user thanh cong"
                };
            }
        }
        public async Task<User> GetUserByEmail(string email)
        {
            var user = await _repository.FindAsync(u => u.Email.Equals(email));
            if (!user.Any()) return null;
            else return user.First();
        }

       
        #endregion
    }
}
