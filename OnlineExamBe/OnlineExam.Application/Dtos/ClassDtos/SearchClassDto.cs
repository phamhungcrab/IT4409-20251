using OnlineExam.Domain.Entities;
using OnlineExam.Application.Dtos.UserDtos;
using OnlineExam.Application.Dtos.SubjectDtos;
using OnlineExam.Application.Dtos.ExamDtos;

namespace OnlineExam.Application.Dtos.SearchClassDtos
{
    public class SearchClassDto : SearchBaseDto
    {
        public string? Name { get; set; }
        public int? TeacherId { get; set; }
        public int? SubjectId { get; set; }

    }
}
