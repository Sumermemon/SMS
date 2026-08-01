using SchoolManagement.Application.DTOs.Common;
using SchoolManagement.Application.DTOs.Teachers;
using SchoolManagement.Application.DTOs.Accounts;

namespace SchoolManagement.Application.Interfaces.Services;

public interface ITeacherService
{
    Task<PagedResult<TeacherListDto>> GetAllAsync(int? subjectId, string? search, int page, int pageSize);
    Task<TeacherDetailDto?> GetByIdAsync(int id);
    Task<TeacherDetailDto> CreateAsync(CreateTeacherDto dto);
    Task<TeacherDetailDto?> UpdateAsync(int id, UpdateTeacherDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface ITeacherPaymentService
{
    Task<IEnumerable<TeacherPaymentDto>> GetAllAsync();
    Task<IEnumerable<TeacherPaymentDto>> GetByTeacherIdAsync(int teacherId);
    Task<TeacherPaymentDto> CreateAsync(CreateTeacherPaymentDto dto);
    Task<TeacherPaymentDto?> UpdateAsync(int id, UpdateTeacherPaymentDto dto);
    Task<bool> DeleteAsync(int id);
}
