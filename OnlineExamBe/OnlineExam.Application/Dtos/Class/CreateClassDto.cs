using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.Class
{
    public class CreateClassDto
    {
        public required string Name {  get; set; }
        public int TeacherId { get; set; }
        public int SubjectId {  get; set; }

    }
}
