using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface IFeeRepository
{
    Task<Fee?> GetByIdAsync(int id);
    Task<IEnumerable<Fee>> GetAllAsync();
    Task<IEnumerable<Fee>> GetByStudentIdAsync(int studentId);
    Task AddAsync(Fee fee);
    Task UpdateAsync(Fee fee);
    Task DeleteAsync(int id);
}
