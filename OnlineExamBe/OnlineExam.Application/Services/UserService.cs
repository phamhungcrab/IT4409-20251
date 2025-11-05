using OnlineExam.Application.Dtos.ReponseDtos;
using OnlineExam.Application.Dtos.RequestDtos;
using OnlineExam.Application.Dtos.RequestDtos.User;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Helpers;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class UserService : CrudService<User>, IUserService
    {
        
        public UserService(IRepository<User> repository) : base(repository)
        {
        }
        #region Admin
        // ke thua tu crud

        /// <summary>
        /// Them nhieu user
        /// </summary>
        /// <param name="userList"></param>
        /// <returns>tai khoan loi ko tao duoc</returns>
        public async Task<ResultApiModel> CreateUsersAsync(CreateUserAdminDto[] userList)
        {
            var validUserList = new List<User>();
            var invalidUserList = new List<CreateUserAdminDto>();

            foreach (var item in userList)
            {
                if (item.Email == null) invalidUserList.Append(item);
                else {
                    var checkMail = await _repository.FindAsync(x => x.Email.ToLower().Equals(item.Email.ToLower()));
                    var checkId = await this.GetByIdAsync(item.Id);


                if (checkMail.Any())
                    {
                        invalidUserList.Add(item);
                    }

                    else if (checkId != null)
                    {
                        invalidUserList.Add(item);
                    }
                    else if (!CheckValidHelper.IsValiddMail(item.Email))
                    {
                        invalidUserList.Add(item);
                    }

                    else
                    {
                        item.PasswordHash = (new Random()).Next(100000, 1000000).ToString();
                        validUserList.Add(item: new User()
                        {
                            Id = item.Id,
                            Email = item.Email,
                            PasswordHash = item.PasswordHash,
                            FullName = item.FullName,
                            DateOfBirth = item.DateOfBirth,
                            Role = item.Role,
                        });
                    }


                }
            }
            await _repository.AddRangeAsync(validUserList);
            await _repository.SaveChangesAsync();
            return new ResultApiModel()
            {
                IsStatus = true,
                MessageCode = ResponseCode.Success,
                Data = invalidUserList
            };
        }
        #endregion

        #region User

        //Các phương thức của User
        public async Task<ResultApiModel> CreateAsync(CreateUserAdminDto user)
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
            if (checkMail.Any())
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Da ton tai email nay"
                };
            }

            if (!CheckValidHelper.IsValiddMail(user.Email))
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.BadRequest,
                    Data = "Sai dinh dang email"
                };
            }
            var newUser = new User()
            {
                DateOfBirth = user.DateOfBirth,
                FullName = user.FullName,
                Email = user.Email,
                PasswordHash = user.PasswordHash!,
                Role = user.Role,

            };
            await base.CreateAsync(newUser);
                return new ResultApiModel()
                {
                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = "Tao user thanh cong"

                };
            
        }
        public async Task<ResultApiModel> UpdateAsync(CreateUserAdminDto user)
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

            if (!CheckValidHelper.IsValiddMail(user.Email))
                {
                    return new ResultApiModel()
                    {
                        IsStatus = false,
                        MessageCode = ResponseCode.BadRequest,
                        Data = "Sai dinh dang email"
                    };
                }
            var checkMail = await _repository.FindAsync(x => x.Email.ToLower().Equals(user.Email.ToLower()));
            if (!checkMail.Any())
            {
                return new ResultApiModel()
                {
                    IsStatus = false,
                    MessageCode = ResponseCode.Conflict,
                    Data = "Khong ton tai"
                };
            }
            
            var newUser = new User()
            {
                DateOfBirth = user.DateOfBirth,
                FullName = user.FullName,
                Email = user.Email,
                PasswordHash = user.PasswordHash!,
                Role = user.Role,

            };
            await base.UpdateAsync(newUser);
                return new ResultApiModel()
                {
                    IsStatus = true,
                    MessageCode = ResponseCode.Success,
                    Data = "Cap nhat user thanh cong"
                };
            
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
