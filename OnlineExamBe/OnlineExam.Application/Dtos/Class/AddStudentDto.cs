using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.Class
{
    public class AddStudentDto
    {
        [EmailAddress]
        public string Email {  get; set; }
        public string MSSV { get; set; }    

    }
}
