using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;
using SchoolManagement.Infrastructure.StoredProcedures;

namespace SchoolManagement.Infrastructure.Repositories;

public class AttendanceRepository : IAttendanceRepository
{
    private readonly AppDbContext _db;
    public AttendanceRepository(AppDbContext db) => _db = db;

    public async Task<Attendance?> GetByIdAsync(int id)
        => await _db.Attendances.FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IEnumerable<Attendance>> GetAllAsync()
        => await _db.Attendances.ToListAsync();

    public async Task<IEnumerable<Attendance>> GetByStudentAsync(int studentId)
        => await _db.Attendances.Where(a => a.StudentId == studentId).ToListAsync();

    public async Task AddAsync(Attendance attendance)
    {
        await _db.Attendances.AddAsync(attendance);
        await _db.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<Attendance> attendances)
    {
        await _db.Attendances.AddRangeAsync(attendances);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Attendance attendance)
    {
        attendance.UpdatedAt = DateTime.UtcNow;
        _db.Attendances.Update(attendance);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Attendances.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<AttendanceSheetResult>> GetAttendanceSheetAsync(int classId, int sectionId, int month, int year)
        => await _db.AttendanceSheetResults
            .FromSqlInterpolated($"SELECT * FROM get_attendance_sheet({classId}, {sectionId}, {month}, {year})")
            .ToListAsync();
}
