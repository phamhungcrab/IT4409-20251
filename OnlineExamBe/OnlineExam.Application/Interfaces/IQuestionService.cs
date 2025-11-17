using OnlineExam.Application.Dtos.Question;
using OnlineExam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface IQuestionService : ICrudService<Question>
    {
        //Phuong thuc rieng cua question
        Task<bool> AddListQuestion(CreateQuestionDto[] questionDtos);
    }

}
