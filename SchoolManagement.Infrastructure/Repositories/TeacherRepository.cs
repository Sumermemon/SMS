using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;

namespace SchoolManagement.Infrastructure.Repositories;

public class TeacherRepository : ITeacherRepository
{
    private readonly AppDbContext _db;
    public TeacherRepository(AppDbContext db) => _db = db;

    public async Task<Teacher?> GetByIdAsync(int id)
        => await _db.Teachers
            .Include(t => t.Subject)
            .Include(t => t.Class)
            .Include(t => t.Section)
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<IEnumerable<Teacher>> GetAllAsync()
        => await _db.Teachers
            .Include(t => t.Subject)
            .Include(t => t.Class)
            .Include(t => t.Section)
            .ToListAsync();

    public async Task AddAsync(Teacher teacher)
    {
        await _db.Teachers.AddAsync(teacher);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Teacher teacher)
    {
        teacher.UpdatedAt = DateTime.UtcNow;
        _db.Teachers.Update(teacher);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Teachers.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
        => await _db.Teachers.AnyAsync(t => t.Id == id);
}
