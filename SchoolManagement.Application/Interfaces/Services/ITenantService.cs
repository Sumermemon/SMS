using SchoolManagement.Application.DTOs.Tenants;

namespace SchoolManagement.Application.Interfaces.Services;

/// <summary>
/// Manages tenants. Only callable by SuperAdmin.
/// </summary>
public interface ITenantService
{
    Task<IEnumerable<TenantDto>> GetAllAsync();
    Task<TenantDto?> GetByIdAsync(int id);
    Task<TenantDto> CreateAsync(CreateTenantDto dto, string createdByUserId);
    Task<TenantDto?> UpdateAsync(int id, UpdateTenantDto dto);
    Task<bool> DeactivateAsync(int id);
    Task<IEnumerable<TenantPermissionDto>> GetPermissionsAsync(int tenantId);
    Task GrantPermissionsAsync(int tenantId, GrantTenantPermissionsDto dto, string grantedByUserId);
    Task SetPermissionsAsync(int tenantId, GrantTenantPermissionsDto dto, string grantedByUserId);
    Task RevokePermissionAsync(int tenantId, string permissionName);
    Task<SuperAdminStatsDto> GetStatsAsync();
}
