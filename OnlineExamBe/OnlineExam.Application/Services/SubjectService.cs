using OnlineExam.Application.Dtos.SubjectDtos;
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
    public class SubjectService : CrudService<Subject> , ISubjectService
    {

        public SubjectService(IRepository<Subject> repository) : base(repository) { }

        public async Task<bool> AddListSubject(CreateSubjectDto[] dto)
        {
            try
            {
                var entities = dto.Select(s => new Subject
                {
                    Name = s.Name,
                    SubjectCode = s.SubjectCode,
                    TotalChapters = s.TotalChapters
                }).ToList();

                await _repository.AddRangeAsync(entities);
                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return false;
            }
            
        }


        public async Task<Subject?> GetByCodeAsync(string code)
        {
            return (await _repository.FindAsync(s => s.SubjectCode == code))
                    .FirstOrDefault();
        }
    }
}
