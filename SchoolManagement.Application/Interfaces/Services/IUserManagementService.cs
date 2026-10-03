using SchoolManagement.Application.DTOs.Users;

namespace SchoolManagement.Application.Interfaces.Services;

/// <summary>
/// Manages users within a tenant. Only callable by tenant Admins.
/// </summary>
public interface IUserManagementService
{
    Task<IEnumerable<UserDto>> GetAllAsync(int tenantId);
    Task<UserDto?> GetByIdAsync(string userId, int tenantId);
    Task<UserDto> CreateAsync(int tenantId, CreateUserDto dto);
    Task<UserDto?> UpdateAsync(string userId, int tenantId, UpdateUserDto dto);
    Task<bool> DeactivateAsync(string userId, int tenantId);
    Task<bool> AssignRoleAsync(string userId, int tenantId, AssignRoleDto dto);
}
