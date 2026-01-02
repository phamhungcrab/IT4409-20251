using OnlineExam.Domain.Entities;
using OnlineExam.Application.Dtos.UserDtos;
using OnlineExam.Application.Dtos.SubjectDtos;
using OnlineExam.Application.Dtos.ExamDtos;

namespace OnlineExam.Application.Dtos.ClassDtos
{
    public class ClassDto
    {
        public int Id { get; set; }
        public  string Name { get; set; }
        public int TeacherId { get; set; }
        public int SubjectId { get; set; }


        public UserDto? Teacher { get; set; }

        public ResponseSubjectDto? Subject { get; set; }


        public ICollection<ExamSimpleDto> Exams { get; set; } = new List<ExamSimpleDto>();

        public ClassDto(Class c)
        {
            Id = c.Id;
            Name = c.Name;
            TeacherId = c.TeacherId;
            SubjectId = c.SubjectId;
            if(c.Teacher != null)
            Teacher = new UserDto(c.Teacher);
            if (c.Subject != null) 
            Subject = new ResponseSubjectDto(c.Subject);
            
            Exams = c.Exams.Select(e => new ExamSimpleDto(e)).ToList();

        }
    }
}
