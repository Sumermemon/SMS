using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;

namespace SchoolManagement.Infrastructure.Repositories;

public class ClassRepository : IClassRepository
{
    private readonly AppDbContext _db;
    public ClassRepository(AppDbContext db) => _db = db;

    public async Task<Class?> GetByIdAsync(int id)
        => await _db.Classes.Include(c => c.Sections).FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IEnumerable<Class>> GetAllAsync()
        => await _db.Classes.Include(c => c.Sections).ToListAsync();

    public async Task AddAsync(Class cls)
    {
        await _db.Classes.AddAsync(cls);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Class cls)
    {
        cls.UpdatedAt = DateTime.UtcNow;
        _db.Classes.Update(cls);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Classes.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}

public class SectionRepository : ISectionRepository
{
    private readonly AppDbContext _db;
    public SectionRepository(AppDbContext db) => _db = db;

    public async Task<Section?> GetByIdAsync(int id)
        => await _db.Sections.Include(s => s.Class).FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<Section>> GetAllAsync()
        => await _db.Sections.Include(s => s.Class).ToListAsync();

    public async Task<IEnumerable<Section>> GetByClassIdAsync(int classId)
        => await _db.Sections.Where(s => s.ClassId == classId).Include(s => s.Class).ToListAsync();

    public async Task AddAsync(Section section)
    {
        await _db.Sections.AddAsync(section);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Section section)
    {
        section.UpdatedAt = DateTime.UtcNow;
        _db.Sections.Update(section);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Sections.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}

public class SubjectRepository : ISubjectRepository
{
    private readonly AppDbContext _db;
    public SubjectRepository(AppDbContext db) => _db = db;

    public async Task<Subject?> GetByIdAsync(int id)
        => await _db.Subjects.Include(s => s.Class).FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<Subject>> GetAllAsync()
        => await _db.Subjects.Include(s => s.Class).ToListAsync();

    public async Task<IEnumerable<Subject>> GetByClassIdAsync(int classId)
        => await _db.Subjects.Where(s => s.ClassId == classId).Include(s => s.Class).ToListAsync();

    public async Task AddAsync(Subject subject)
    {
        await _db.Subjects.AddAsync(subject);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Subject subject)
    {
        subject.UpdatedAt = DateTime.UtcNow;
        _db.Subjects.Update(subject);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Subjects.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}
