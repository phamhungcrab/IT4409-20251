using OnlineExam.Application.Dtos.About;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface IAboutService : ICrudService<User>
    {
        /// <summary>
        /// Lấy thông tin cấu hình
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public AboutDto GetAboutAsync();
    }
}
