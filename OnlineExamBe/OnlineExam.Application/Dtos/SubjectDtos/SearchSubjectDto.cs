using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.SubjectDtos
{
    public class SearchSubjectDto : SearchBaseDto
    {
        public required string Name { get; set; }
        public required string SubjectCode { get; set; }
    }


}
