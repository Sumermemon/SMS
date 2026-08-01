using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface IClassRepository
{
    Task<Class?> GetByIdAsync(int id);
    Task<IEnumerable<Class>> GetAllAsync();
    Task AddAsync(Class cls);
    Task UpdateAsync(Class cls);
    Task DeleteAsync(int id);
}
