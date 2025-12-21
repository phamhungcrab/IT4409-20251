using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OnlineExam.Application.Interfaces;
using OnlineExam.Domain.Interfaces;

namespace OnlineExam.Application.Services.Base
{
    public class CrudService<T> : ICrudService<T> where T : class
    {
        public readonly IRepository<T> _repository;

        public CrudService(IRepository<T> repository)
        {
            _repository = repository;
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(params string[] includes)
        {
            return await _repository.GetAllAsync(includes);
        }

        public virtual async Task<T?> GetByIdAsync(int id, params string[] includes)
        {
            return await _repository.GetByIdAsync(id,includes);
        }

        public virtual async Task CreateAsync(T enity)
        {
            await _repository.AddAsync(enity);
            await _repository.SaveChangesAsync();     
        }

        public virtual async Task<bool> UpdateAsync(T entity)
        {
            var checkExis = await _repository.GetByIdAsync(GetEntityId(entity));
            if (checkExis == null) return false;
            _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();

            return true;
        }

        public virtual async Task<bool> DeleteAsync(int id)
        {
            var checkExis = await _repository.GetByIdAsync(id);
            if (checkExis == null) return false;

            _repository.DeleteAsync(checkExis);
            await _repository.SaveChangesAsync();
            return true;
        }

        //Can ghi de neu khoa chinh id ten khac
        protected virtual int GetEntityId(T entity)
        {
            var idProperty = typeof(T).GetProperty("Id");
            if (idProperty == null)
                return 0;

            var value = idProperty.GetValue(entity);
            return value is int id ? id : 0;
        }
    }
}
