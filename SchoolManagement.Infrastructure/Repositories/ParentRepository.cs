using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;

namespace SchoolManagement.Infrastructure.Repositories;

public class ParentRepository : IParentRepository
{
    private readonly AppDbContext _db;
    public ParentRepository(AppDbContext db) => _db = db;

    public async Task<Parent?> GetByIdAsync(int id)
        => await _db.Parents.Include(p => p.Students).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Parent>> GetAllAsync()
        => await _db.Parents.Include(p => p.Students).ToListAsync();

    public async Task AddAsync(Parent parent)
    {
        await _db.Parents.AddAsync(parent);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Parent parent)
    {
        parent.UpdatedAt = DateTime.UtcNow;
        _db.Parents.Update(parent);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Parents.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
        => await _db.Parents.AnyAsync(p => p.Id == id);
}
