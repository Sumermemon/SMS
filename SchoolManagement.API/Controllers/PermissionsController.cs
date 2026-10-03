using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Infrastructure.Data;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.API.Controllers;

/// <summary>
/// Lists available permissions — for UI dropdowns when building roles.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;

    public PermissionsController(AppDbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    /// <summary>
    /// Returns all permissions available to the current tenant.
    /// SuperAdmin sees ALL permissions. Tenant users see only their tenant's granted permissions.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (_tenantContext.IsSuperAdmin)
        {
            var allPerms = await _db.Permissions
                .AsNoTracking()
                .OrderBy(p => p.Module).ThenBy(p => p.Name)
                .Select(p => new { p.Id, p.Name, p.DisplayName, p.Module })
                .ToListAsync();
            return Ok(allPerms);
        }

        // Return only permissions granted to this tenant
        var tenantPerms = await _db.TenantPermissions
            .AsNoTracking()
            .Where(tp => tp.TenantId == _tenantContext.TenantId)
            .Select(tp => new { tp.Permission.Id, tp.Permission.Name, tp.Permission.DisplayName, tp.Permission.Module })
            .OrderBy(p => p.Module).ThenBy(p => p.Name)
            .ToListAsync();

        return Ok(tenantPerms);
    }
}
