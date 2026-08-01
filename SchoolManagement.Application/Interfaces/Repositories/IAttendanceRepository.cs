using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface IAttendanceRepository
{
    Task<Attendance?> GetByIdAsync(int id);
    Task<IEnumerable<Attendance>> GetAllAsync();
    Task<IEnumerable<Attendance>> GetByStudentAsync(int studentId);
    Task AddAsync(Attendance attendance);
    Task AddRangeAsync(IEnumerable<Attendance> attendances);
    Task UpdateAsync(Attendance attendance);
    Task DeleteAsync(int id);
}
