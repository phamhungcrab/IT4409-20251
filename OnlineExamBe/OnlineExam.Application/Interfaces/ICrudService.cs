using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    public interface ICrudService<T> where T : class
    {

        Task<IEnumerable<T>> GetAllAsync(params string[] includes);
        Task<T?> GetByIdAsync(int id, params string[] includes);
        Task CreateAsync(T entity);
        Task<bool> UpdateAsync(T entity);
        Task<bool> DeleteAsync(int id);
    }
}
