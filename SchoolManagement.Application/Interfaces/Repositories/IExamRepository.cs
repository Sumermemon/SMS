using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface IExamRepository
{
    Task<Exam?> GetByIdAsync(int id);
    Task<IEnumerable<Exam>> GetAllAsync();
    Task AddAsync(Exam exam);
    Task UpdateAsync(Exam exam);
    Task DeleteAsync(int id);
}
