using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OnlineExam.Domain.Enums;
namespace OnlineExam.Application.Dtos.ResponseDtos
{
    public class ResultApiModel
    {
        public object? Data { get; set; }
        public int? MessageCode { get; set; }
        public bool? IsStatus { get; set; } = false;
    }
}
