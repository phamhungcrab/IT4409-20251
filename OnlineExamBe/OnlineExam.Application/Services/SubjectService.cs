using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.ExamDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Dtos.SubjectDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Services.Base;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
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

        public async Task<ResultApiModel> SearchForAdminAsync(SearchSubjectDto searchModel)
        {
            var query = _repository.Query();
            if (!string.IsNullOrEmpty(searchModel.Name))
            {
                var name = searchModel.Name.ToLower().Trim();
                query = query.Where(c => c.Name.ToLower().Trim().Contains(name));
            }
            if (!string.IsNullOrEmpty(searchModel.SubjectCode))
            {
                var code = searchModel.SubjectCode.ToLower().Trim();
                query = query.Where(c => c.SubjectCode.ToLower().Trim().Contains(code));
            }
            var totalItems = await query.CountAsync();

            var subjects = await query
                .Skip((searchModel.PageNumber - 1) * searchModel.PageSize)
                .Take(searchModel.PageSize)
                .Select(c => new ResponseSubjectDto(c))
                .ToListAsync();

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new
                {
                    TotalItems = totalItems,
                    Users = subjects
                }
            };

        }

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
