using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface ITransportRepository
{
    Task<Transport?> GetByIdAsync(int id);
    Task<IEnumerable<Transport>> GetAllAsync();
    Task AddAsync(Transport transport);
    Task UpdateAsync(Transport transport);
    Task DeleteAsync(int id);
}
