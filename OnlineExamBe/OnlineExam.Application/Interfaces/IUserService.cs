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
        //Phuong thuc riêng đối với user

    }
}
