using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface ITeacherRepository
{
    Task<Teacher?> GetByIdAsync(int id);
    Task<IEnumerable<Teacher>> GetAllAsync();
    Task AddAsync(Teacher teacher);
    Task UpdateAsync(Teacher teacher);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
