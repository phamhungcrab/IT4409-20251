using OnlineExam.Application.Dtos.ResponseDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface IDashboardService
    {
        public Task<ResultApiModel> GetInfo();
    }
}
