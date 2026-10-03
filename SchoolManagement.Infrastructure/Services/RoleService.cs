using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.DTOs.Roles;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Domain.Common;
using SchoolManagement.Infrastructure.Data;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly RoleManager<AppRole> _roleManager;
    private readonly AppDbContext _db;

    public RoleService(RoleManager<AppRole> roleManager, AppDbContext db)
    {
        _roleManager = roleManager;
        _db = db;
    }

    public async Task<IEnumerable<RoleDto>> GetAllAsync(int tenantId)
    {
        var roles = await _roleManager.Roles
            .Where(r => r.TenantId == tenantId)
            .ToListAsync();

        var result = new List<RoleDto>();
        foreach (var role in roles)
        {
            var claims = await _roleManager.GetClaimsAsync(role);
            var perms = claims.Where(c => c.Type == "permission").Select(c => c.Value).ToList();
            var displayName = role.Name!.Contains('_') ? role.Name.Split('_', 2)[1] : role.Name;
            result.Add(new RoleDto(role.Id, role.Name!, displayName, role.Description, tenantId, perms));
        }
        return result;
    }

    public async Task<RoleDto?> GetByIdAsync(string roleId, int tenantId)
    {
        var role = await _roleManager.FindByIdAsync(roleId);
        if (role == null || role.TenantId != tenantId) return null;

        var claims = await _roleManager.GetClaimsAsync(role);
        var perms = claims.Where(c => c.Type == "permission").Select(c => c.Value).ToList();
        var displayName = role.Name!.Contains('_') ? role.Name.Split('_', 2)[1] : role.Name;
        return new RoleDto(role.Id, role.Name!, displayName, role.Description, tenantId, perms);
    }

    public async Task<RoleDto> CreateAsync(int tenantId, CreateRoleDto dto)
    {
        // 1. Validate that all requested permissions are enabled for this tenant
        await ValidatePermissionsAllowedForTenantAsync(tenantId, dto.Permissions);

        var scopedName = $"T{tenantId}_{dto.Name}";
        if (await _roleManager.RoleExistsAsync(scopedName))
            throw new InvalidOperationException($"Role '{dto.Name}' already exists in this tenant.");

        var role = new AppRole(scopedName)
        {
            TenantId    = tenantId,
            Description = dto.Description
        };

        var result = await _roleManager.CreateAsync(role);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        foreach (var perm in dto.Permissions)
            await _roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("permission", perm));

        var perms = (await _roleManager.GetClaimsAsync(role))
            .Where(c => c.Type == "permission").Select(c => c.Value).ToList();
        return new RoleDto(role.Id, role.Name!, dto.Name, role.Description, tenantId, perms);
    }

    public async Task<RoleDto?> UpdateAsync(string roleId, int tenantId, UpdateRoleDto dto)
    {
        var role = await _roleManager.FindByIdAsync(roleId);
        if (role == null || role.TenantId != tenantId) return null;

        // 1. Validate permissions against tenant's available permissions
        await ValidatePermissionsAllowedForTenantAsync(tenantId, dto.Permissions);

        role.Description = dto.Description;
        await _roleManager.UpdateAsync(role);

        // Replace permission claims
        var existingClaims = (await _roleManager.GetClaimsAsync(role))
            .Where(c => c.Type == "permission").ToList();
        foreach (var c in existingClaims)
            await _roleManager.RemoveClaimAsync(role, c);
        foreach (var perm in dto.Permissions)
            await _roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("permission", perm));

        var displayName = role.Name!.Contains('_') ? role.Name.Split('_', 2)[1] : role.Name;
        return new RoleDto(role.Id, role.Name!, displayName, role.Description, tenantId, dto.Permissions);
    }

    public async Task<bool> DeleteAsync(string roleId, int tenantId)
    {
        var role = await _roleManager.FindByIdAsync(roleId);
        if (role == null || role.TenantId != tenantId) return false;

        // Disallow deleting system roles
        var displayName = role.Name!.Contains('_') ? role.Name.Split('_', 2)[1] : role.Name;
        if (SystemRoles.IsSystemRole(displayName))
        {
            throw new InvalidOperationException("System administration roles cannot be deleted.");
        }

        var result = await _roleManager.DeleteAsync(role);
        return result.Succeeded;
    }

    private async Task ValidatePermissionsAllowedForTenantAsync(int tenantId, IEnumerable<string> requestedPermissions)
    {
        var availablePerms = await _db.TenantPermissions
            .AsNoTracking()
            .Where(tp => tp.TenantId == tenantId)
            .Select(tp => tp.Permission.Name)
            .ToListAsync();

        var availableSet = new HashSet<string>(availablePerms, StringComparer.OrdinalIgnoreCase);

        foreach (var perm in requestedPermissions)
        {
            // Block assigning SuperAdmin-only system permissions
            if (perm.StartsWith("tenants.", StringComparison.OrdinalIgnoreCase) ||
                perm.StartsWith("cms.", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"System-level permission '{perm}' cannot be assigned to tenant roles.");
            }

            if (!availableSet.Contains(perm))
            {
                throw new InvalidOperationException($"Permission '{perm}' is not available/enabled for this tenant.");
            }
        }
    }
}
