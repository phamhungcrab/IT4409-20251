using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos
{
    public class SearchBaseDto
    {
        public SearchBaseDto()
        {
            PageSize = 10;
            PageNumber = 1;
        }
        public int PageSize { get; set; } 

        public int PageNumber { get; set; } 


    }
}
