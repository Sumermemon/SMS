using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface IStudentRepository
{
    Task<Student?> GetByIdAsync(int id);
    Task<IEnumerable<Student>> GetAllAsync();
    Task AddAsync(Student student);
    Task UpdateAsync(Student student);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
