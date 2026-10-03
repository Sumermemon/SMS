using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface IClassRoutineRepository
{
    Task<ClassRoutine?> GetByIdAsync(int id);
    Task<ClassRoutine?> GetByIdForUpdateAsync(int id);
    Task<IEnumerable<ClassRoutine>> GetAllAsync();
    Task AddAsync(ClassRoutine routine);
    Task UpdateAsync(ClassRoutine routine);
    Task DeleteAsync(int id);
}
