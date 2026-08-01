using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface ISectionRepository
{
    Task<Section?> GetByIdAsync(int id);
    Task<IEnumerable<Section>> GetAllAsync();
    Task<IEnumerable<Section>> GetByClassIdAsync(int classId);
    Task AddAsync(Section section);
    Task UpdateAsync(Section section);
    Task DeleteAsync(int id);
}
