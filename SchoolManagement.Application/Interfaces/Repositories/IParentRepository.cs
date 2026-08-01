using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface IParentRepository
{
    Task<Parent?> GetByIdAsync(int id);
    Task<IEnumerable<Parent>> GetAllAsync();
    Task AddAsync(Parent parent);
    Task UpdateAsync(Parent parent);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
