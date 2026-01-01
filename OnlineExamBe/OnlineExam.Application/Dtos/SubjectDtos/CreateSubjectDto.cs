using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.SubjectDtos
{
    public class CreateSubjectDto
    {
        public required string Name { get; set; }
        public required string SubjectCode { get; set; }
        public int TotalChapters { get; set; }  // Số chương trong môn học
    }

    public class ResponseSubjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string SubjectCode { get; set; }
        public int TotalChapters { get; set; }

        public ResponseSubjectDto(Subject s)
        {
            Id = s.Id;
            Name = s.Name;
            SubjectCode = s.SubjectCode;
            TotalChapters = s.TotalChapters;
        }
        public ResponseSubjectDto() { }
    }

    public class UpdateSubjectDto
    {
        public required string Name { get; set; }
        public required string SubjectCode { get; set; }
        public int TotalChapters { get; set; }
    }

}
