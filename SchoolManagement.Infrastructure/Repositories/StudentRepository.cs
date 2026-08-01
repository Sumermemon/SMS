using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;

namespace SchoolManagement.Infrastructure.Repositories;

public class StudentRepository : IStudentRepository
{
    private readonly AppDbContext _db;
    public StudentRepository(AppDbContext db) => _db = db;

    public async Task<Student?> GetByIdAsync(int id)
        => await _db.Students
            .Include(s => s.Class)
            .Include(s => s.Section)
            .Include(s => s.Parent)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<Student>> GetAllAsync()
        => await _db.Students
            .Include(s => s.Class)
            .Include(s => s.Section)
            .Include(s => s.Parent)
            .ToListAsync();

    public async Task AddAsync(Student student)
    {
        await _db.Students.AddAsync(student);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Student student)
    {
        student.UpdatedAt = DateTime.UtcNow;
        _db.Students.Update(student);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Students.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
        => await _db.Students.AnyAsync(s => s.Id == id);
}
