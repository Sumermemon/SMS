using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.DTOs.Tenants;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.Infrastructure.Services;

public class TenantService : ITenantService
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<AppRole> _roleManager;

    public TenantService(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<AppRole> roleManager)
    {
        _db = db;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<IEnumerable<TenantDto>> GetAllAsync()
    {
        var tenants = await _db.Tenants
            .AsNoTracking()
            .Include(t => t.TenantPermissions)
            .ToListAsync();

        var result = new List<TenantDto>();
        foreach (var t in tenants)
        {
            var studentCount = await _db.Students.IgnoreQueryFilters()
                .CountAsync(s => s.TenantId == t.Id && !s.IsDeleted);
            var teacherCount = await _db.Teachers.IgnoreQueryFilters()
                .CountAsync(tc => tc.TenantId == t.Id && !tc.IsDeleted);
            result.Add(MapToDto(t, studentCount, teacherCount));
        }
        return result;
    }

    public async Task<TenantDto?> GetByIdAsync(int id)
    {
        var t = await _db.Tenants.AsNoTracking()
            .Include(t => t.TenantPermissions)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (t == null) return null;
        var studentCount = await _db.Students.IgnoreQueryFilters()
            .CountAsync(s => s.TenantId == t.Id && !s.IsDeleted);
        var teacherCount = await _db.Teachers.IgnoreQueryFilters()
            .CountAsync(tc => tc.TenantId == t.Id && !tc.IsDeleted);
        return MapToDto(t, studentCount, teacherCount);
    }

    public async Task<TenantDto> CreateAsync(CreateTenantDto dto, string createdByUserId)
    {
        if (await _db.Tenants.AnyAsync(t => t.SlugCode == dto.SlugCode))
            throw new InvalidOperationException($"Tenant with slug '{dto.SlugCode}' already exists.");

        var tenant = new Tenant
        {
            Name          = dto.Name,
            SlugCode      = dto.SlugCode.ToLower(),
            ContactEmail  = dto.ContactEmail,
            Phone         = dto.Phone,
            Address       = dto.Address,
            LogoUrl       = dto.LogoUrl,
            PlanExpiryDate = dto.PlanExpiryDate.HasValue ? DateTime.SpecifyKind(dto.PlanExpiryDate.Value, DateTimeKind.Utc) : null,
            IsActive      = true,
            SmtpHost      = dto.SmtpHost,
            SmtpPort      = dto.SmtpPort ?? 587,
            SmtpUsername  = dto.SmtpUsername,
            SmtpPassword  = dto.SmtpPassword,
            SmtpSenderEmail = dto.SmtpSenderEmail,
            SmtpSenderName  = dto.SmtpSenderName,
            SmtpEnableSsl   = dto.SmtpEnableSsl ?? true
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync();

        // 1. Grant initial tenant-eligible permissions
        var eligiblePerms = await _db.Permissions
            .Where(p => !p.Name.StartsWith("tenants.") && !p.Name.StartsWith("cms."))
            .ToListAsync();

        var tenantPerms = eligiblePerms.Select(p => new TenantPermission
        {
            TenantId     = tenant.Id,
            PermissionId = p.Id,
            GrantedBy    = createdByUserId
        }).ToList();

        await _db.TenantPermissions.AddRangeAsync(tenantPerms);
        await _db.SaveChangesAsync();

        // 2. Create the scoped TenantAdmin role: "T{tenantId}_Admin"
        var adminRoleName = $"T{tenant.Id}_Admin";
        if (!await _roleManager.RoleExistsAsync(adminRoleName))
        {
            var role = new AppRole(adminRoleName)
            {
                TenantId    = tenant.Id,
                Description = $"Tenant Administrator role for {tenant.Name}"
            };
            await _roleManager.CreateAsync(role);

            foreach (var perm in eligiblePerms)
            {
                await _roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("permission", perm.Name));
            }
        }

        // 3. Automatically create the TenantAdmin user
        var user = new ApplicationUser
        {
            UserName       = dto.ContactEmail,
            Email          = dto.ContactEmail,
            FirstName      = dto.Name,
            LastName       = "Admin",
            Role           = SchoolManagement.Domain.Enums.UserRole.Admin,
            TenantId       = tenant.Id,
            IsSuperAdmin   = false,
            IsActive       = true,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, dto.AdminPassword);
        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, adminRoleName);
            await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("tenantId", tenant.Id.ToString()));
        }
        else
        {
            throw new InvalidOperationException("Failed to create admin user: " + string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        return MapToDto(tenant, 0, 0);
    }

    public async Task<TenantDto?> UpdateAsync(int id, UpdateTenantDto dto)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return null;

        tenant.Name          = dto.Name;
        tenant.ContactEmail  = dto.ContactEmail;
        tenant.Phone         = dto.Phone;
        tenant.Address       = dto.Address;
        tenant.LogoUrl       = dto.LogoUrl;
        tenant.IsActive      = dto.IsActive;
        tenant.PlanExpiryDate = dto.PlanExpiryDate.HasValue ? DateTime.SpecifyKind(dto.PlanExpiryDate.Value, DateTimeKind.Utc) : null;
        tenant.SmtpHost      = dto.SmtpHost;
        tenant.SmtpPort      = dto.SmtpPort ?? 587;
        tenant.SmtpUsername  = dto.SmtpUsername;
        tenant.SmtpPassword  = dto.SmtpPassword;
        tenant.SmtpSenderEmail = dto.SmtpSenderEmail;
        tenant.SmtpSenderName  = dto.SmtpSenderName;
        tenant.SmtpEnableSsl   = dto.SmtpEnableSsl ?? true;

        await _db.SaveChangesAsync();

        var studentCount = await _db.Students.IgnoreQueryFilters()
            .CountAsync(s => s.TenantId == id && !s.IsDeleted);
        var teacherCount = await _db.Teachers.IgnoreQueryFilters()
            .CountAsync(tc => tc.TenantId == id && !tc.IsDeleted);
        return MapToDto(tenant, studentCount, teacherCount);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return false;
        tenant.IsActive = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<TenantPermissionDto>> GetPermissionsAsync(int tenantId)
    {
        return await _db.TenantPermissions
            .AsNoTracking()
            .Where(tp => tp.TenantId == tenantId)
            .Select(tp => new TenantPermissionDto(
                tp.PermissionId, tp.Permission.Name, tp.Permission.DisplayName,
                tp.Permission.Module, tp.GrantedAt))
            .ToListAsync();
    }

    public Task GrantPermissionsAsync(int tenantId, GrantTenantPermissionsDto dto, string grantedByUserId)
        => SetPermissionsAsync(tenantId, dto, grantedByUserId);

    public async Task SetPermissionsAsync(int tenantId, GrantTenantPermissionsDto dto, string grantedByUserId)
    {
        _ = await _db.Tenants.FindAsync(tenantId)
            ?? throw new KeyNotFoundException($"Tenant {tenantId} not found.");

        // Filter out system-level permissions (e.g. tenants.*, cms.*)
        var requestedPermNames = (dto.PermissionNames ?? new List<string>())
            .Where(name => !name.StartsWith("tenants.") && !name.StartsWith("cms."))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var existing = await _db.TenantPermissions
            .Where(tp => tp.TenantId == tenantId)
            .Include(tp => tp.Permission)
            .ToListAsync();

        var existingNames = existing.Select(e => e.Permission.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);

        // 1. Remove permissions that are not in requested set
        var toRemove = existing.Where(e => !requestedPermNames.Contains(e.Permission.Name)).ToList();
        if (toRemove.Count > 0)
        {
            _db.TenantPermissions.RemoveRange(toRemove);
        }

        // 2. Add permissions that are in requested set but not yet in existing
        var permissions = await _db.Permissions
            .Where(p => requestedPermNames.Contains(p.Name))
            .ToListAsync();

        var toAdd = permissions
            .Where(p => !existingNames.Contains(p.Name))
            .Select(p => new TenantPermission
            {
                TenantId     = tenantId,
                PermissionId = p.Id,
                GrantedBy    = grantedByUserId
            }).ToList();

        if (toAdd.Count > 0)
        {
            await _db.TenantPermissions.AddRangeAsync(toAdd);
        }

        await _db.SaveChangesAsync();

        // 3. Keep tenant admin role permission claims in sync
        var adminRoleName = $"T{tenantId}_Admin";
        var adminRole = await _roleManager.FindByNameAsync(adminRoleName);
        if (adminRole != null)
        {
            var existingClaims = (await _roleManager.GetClaimsAsync(adminRole))
                .Where(c => c.Type == "permission").ToList();

            // Revoke claims that the tenant no longer has
            foreach (var claim in existingClaims.Where(c => !requestedPermNames.Contains(c.Value)))
            {
                await _roleManager.RemoveClaimAsync(adminRole, claim);
            }

            // Add newly granted permission claims
            var existingClaimValues = existingClaims.Select(c => c.Value).ToHashSet();
            foreach (var permName in requestedPermNames.Where(n => !existingClaimValues.Contains(n)))
            {
                await _roleManager.AddClaimAsync(adminRole, new System.Security.Claims.Claim("permission", permName));
            }
        }
    }

    public async Task RevokePermissionAsync(int tenantId, string permissionName)
    {
        var permission = await _db.Permissions.FirstOrDefaultAsync(p => p.Name == permissionName);
        if (permission == null) return;

        var tp = await _db.TenantPermissions
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.PermissionId == permission.Id);

        if (tp != null)
        {
            _db.TenantPermissions.Remove(tp);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<SuperAdminStatsDto> GetStatsAsync()
    {
        var tenants = await _db.Tenants.AsNoTracking().ToListAsync();
        var now = DateTime.UtcNow;

        int totalStudents = await _db.Students.IgnoreQueryFilters().CountAsync(s => !s.IsDeleted);
        int totalTeachers = await _db.Teachers.IgnoreQueryFilters().CountAsync(t => !t.IsDeleted);
        int totalUsers    = await _userManager.Users.CountAsync();

        return new SuperAdminStatsDto(
            TotalTenants:          tenants.Count,
            ActiveTenants:         tenants.Count(t => t.IsActive),
            InactiveTenants:       tenants.Count(t => !t.IsActive),
            ExpiringWithin30Days:  tenants.Count(t => t.PlanExpiryDate.HasValue
                                       && t.PlanExpiryDate.Value > now
                                       && t.PlanExpiryDate.Value <= now.AddDays(30)),
            TotalStudents:         totalStudents,
            TotalTeachers:         totalTeachers,
            TotalUsers:            totalUsers
        );
    }

    private static TenantDto MapToDto(Tenant t, int studentCount, int teacherCount) =>
        new(t.Id, t.Name, t.SlugCode, t.ContactEmail, t.Phone, t.Address, t.LogoUrl,
            t.IsActive, t.CreatedAt, t.PlanExpiryDate, t.LastLoginAt,
            t.TenantPermissions.Count, studentCount, teacherCount,
            t.SmtpHost, t.SmtpPort, t.SmtpUsername, t.SmtpPassword,
            t.SmtpSenderEmail, t.SmtpSenderName, t.SmtpEnableSsl);
}
