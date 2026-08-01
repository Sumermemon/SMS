using SchoolManagement.Application.DTOs.Common;
using SchoolManagement.Application.DTOs.Students;

namespace SchoolManagement.Application.Interfaces.Services;

public interface IStudentService
{
    Task<PagedResult<StudentListDto>> GetAllAsync(int? classId, string? search, int page, int pageSize);
    Task<StudentDetailDto?> GetByIdAsync(int id);
    Task<StudentDetailDto> CreateAsync(CreateStudentDto dto);
    Task<StudentDetailDto?> UpdateAsync(int id, UpdateStudentDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> PromoteAsync(PromoteStudentDto dto);
}
