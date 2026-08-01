using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface ITeacherPaymentRepository
{
    Task<TeacherPayment?> GetByIdAsync(int id);
    Task<IEnumerable<TeacherPayment>> GetAllAsync();
    Task<IEnumerable<TeacherPayment>> GetByTeacherIdAsync(int teacherId);
    Task AddAsync(TeacherPayment payment);
    Task UpdateAsync(TeacherPayment payment);
    Task DeleteAsync(int id);
}
