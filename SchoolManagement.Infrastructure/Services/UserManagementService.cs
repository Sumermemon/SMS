using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.DTOs.Users;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.Infrastructure.Services;

public class UserManagementService : IUserManagementService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserManagementService(UserManager<ApplicationUser> userManager)
        => _userManager = userManager;

    private static UserDto ToDto(ApplicationUser u, IList<string> roles) => new(
        u.Id, u.Email ?? string.Empty, u.FirstName, u.LastName,
        $"{u.FirstName} {u.LastName}", u.Role, u.PhotoUrl,
        u.IsActive, u.TenantId, u.IsSuperAdmin, u.CreatedAt, roles);

    public async Task<IEnumerable<UserDto>> GetAllAsync(int tenantId)
    {
        var users = await _userManager.Users
            .Where(u => u.TenantId == tenantId)
            .ToListAsync();

        var result = new List<UserDto>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            result.Add(ToDto(u, roles));
        }
        return result;
    }

    public async Task<UserDto?> GetByIdAsync(string userId, int tenantId)
    {
        var u = await _userManager.FindByIdAsync(userId);
        if (u == null || u.TenantId != tenantId) return null;
        var roles = await _userManager.GetRolesAsync(u);
        return ToDto(u, roles);
    }

    public async Task<UserDto> CreateAsync(int tenantId, CreateUserDto dto)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
            throw new InvalidOperationException($"Email '{dto.Email}' is already registered.");

        var user = new ApplicationUser
        {
            UserName       = dto.Email,
            Email          = dto.Email,
            EmailConfirmed = true,
            FirstName      = dto.FirstName,
            LastName       = dto.LastName,
            Role           = dto.Role,
            PhotoUrl       = dto.PhotoUrl,
            TenantId       = tenantId,
            IsSuperAdmin   = false,
            IsActive       = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        // Add to role
        var scopedRole = dto.RoleName.StartsWith($"T{tenantId}_")
            ? dto.RoleName
            : $"T{tenantId}_{dto.RoleName}";

        await _userManager.AddToRoleAsync(user, scopedRole);
        await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("tenantId", tenantId.ToString()));

        var roles = await _userManager.GetRolesAsync(user);
        return ToDto(user, roles);
    }

    public async Task<UserDto?> UpdateAsync(string userId, int tenantId, UpdateUserDto dto)
    {
        var u = await _userManager.FindByIdAsync(userId);
        if (u == null || u.TenantId != tenantId) return null;

        u.FirstName = dto.FirstName;
        u.LastName  = dto.LastName;
        u.PhotoUrl  = dto.PhotoUrl;
        u.IsActive  = dto.IsActive;

        await _userManager.UpdateAsync(u);
        var roles = await _userManager.GetRolesAsync(u);
        return ToDto(u, roles);
    }

    public async Task<bool> DeactivateAsync(string userId, int tenantId)
    {
        var u = await _userManager.FindByIdAsync(userId);
        if (u == null || u.TenantId != tenantId) return false;
        u.IsActive = false;
        await _userManager.UpdateAsync(u);
        return true;
    }

    public async Task<bool> AssignRoleAsync(string userId, int tenantId, AssignRoleDto dto)
    {
        var u = await _userManager.FindByIdAsync(userId);
        if (u == null || u.TenantId != tenantId) return false;

        var currentRoles = await _userManager.GetRolesAsync(u);
        // Remove all existing tenant roles
        var tenantRoles = currentRoles.Where(r => r.StartsWith($"T{tenantId}_")).ToList();
        if (tenantRoles.Count > 0)
            await _userManager.RemoveFromRolesAsync(u, tenantRoles);

        var scopedRole = dto.RoleName.StartsWith($"T{tenantId}_")
            ? dto.RoleName
            : $"T{tenantId}_{dto.RoleName}";

        var result = await _userManager.AddToRoleAsync(u, scopedRole);
        return result.Succeeded;
    }
}
