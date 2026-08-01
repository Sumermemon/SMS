using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface INoticeRepository
{
    Task<Notice?> GetByIdAsync(int id);
    Task<IEnumerable<Notice>> GetAllAsync();
    Task AddAsync(Notice notice);
    Task UpdateAsync(Notice notice);
    Task DeleteAsync(int id);
}
