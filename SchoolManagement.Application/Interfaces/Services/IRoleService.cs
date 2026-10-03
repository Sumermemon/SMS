using SchoolManagement.Application.DTOs.Roles;

namespace SchoolManagement.Application.Interfaces.Services;

/// <summary>
/// Manages tenant-scoped roles. Only callable by tenant Admins.
/// </summary>
public interface IRoleService
{
    Task<IEnumerable<RoleDto>> GetAllAsync(int tenantId);
    Task<RoleDto?> GetByIdAsync(string roleId, int tenantId);
    Task<RoleDto> CreateAsync(int tenantId, CreateRoleDto dto);
    Task<RoleDto?> UpdateAsync(string roleId, int tenantId, UpdateRoleDto dto);
    Task<bool> DeleteAsync(string roleId, int tenantId);
}
