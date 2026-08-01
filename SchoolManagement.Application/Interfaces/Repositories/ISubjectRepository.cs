using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface ISubjectRepository
{
    Task<Subject?> GetByIdAsync(int id);
    Task<IEnumerable<Subject>> GetAllAsync();
    Task<IEnumerable<Subject>> GetByClassIdAsync(int classId);
    Task AddAsync(Subject subject);
    Task UpdateAsync(Subject subject);
    Task DeleteAsync(int id);
}
