using OnlineExam.Application.Dtos.ExamBlueprint;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface IExamBlueprintService : ICrudService<ExamBlueprint>
    {
        Task<ExamBlueprintDto> CreateBlueprintAsync(CreateExamBlueprintDto dto);
    }
}
