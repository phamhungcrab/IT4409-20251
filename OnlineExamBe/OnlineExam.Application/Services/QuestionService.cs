using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    public class QuestionService : CrudService<Question>, IQuestionService
    {
        public QuestionService(IRepository<Question> repo)
        : base(repo)
        {
        }
    }
}
