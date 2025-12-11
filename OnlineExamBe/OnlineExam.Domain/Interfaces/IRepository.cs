using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Interfaces
{
    public interface IRepository<T> where T : class
    {

        Task<IEnumerable<T>> GetAllAsync(params string[]  includes );
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, params string[] includes);
        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        void DeleteAsync(T entity);
        void UpdateAsync(T entity);
        public IQueryable<T> Query();
        Task SaveChangesAsync();

        public Task<List<TResult>> JoinAsync<T2, TKey, TResult>(
            Expression<Func<T, TKey>> outerSelector,
            Expression<Func<T2, TKey>> innerSelector,
            Expression<Func<T,bool>> predicate, 
            Expression<Func<T, T2, TResult>> resultSelector
            )
         where T2 : class;

   
    
    }
}
