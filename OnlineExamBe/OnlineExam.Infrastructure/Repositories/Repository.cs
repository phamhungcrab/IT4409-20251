using Microsoft.EntityFrameworkCore;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ExamSystemDbContext _dbcontext;
        private readonly DbSet<T> _dbSet;

        public Repository(ExamSystemDbContext dbcontext)
        {
            _dbcontext = dbcontext;
            _dbSet = _dbcontext.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
            => await _dbSet.ToListAsync();

        public async Task<T?> GetByIdAsync(int id)
            => await _dbSet.FindAsync(id);

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
            => await _dbSet.Where(predicate).ToListAsync();

        public async Task AddAsync(T entity)
            => await _dbSet.AddAsync(entity);

        public void DeleteAsync(T entity)
            => _dbSet.Remove(entity);

        public void UpdateAsync(T entity)
            => _dbSet.Update(entity);

        public async Task SaveChangesAsync()
        {
            await _dbcontext.SaveChangesAsync();
        }
    }
}
