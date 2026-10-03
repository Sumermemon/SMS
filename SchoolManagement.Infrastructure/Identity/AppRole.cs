using Microsoft.AspNetCore.Identity;

namespace SchoolManagement.Infrastructure.Identity;

/// <summary>
/// Extends IdentityRole with tenant scoping and description.
/// Roles are scoped per-tenant so "Admin" in Tenant A is independent of "Admin" in Tenant B.
/// SuperAdmin's roles have TenantId = null.
/// </summary>
public class AppRole : IdentityRole
{
    public AppRole() { }
    public AppRole(string roleName) : base(roleName) { }

    /// <summary>Null for global/SuperAdmin roles; set for tenant-scoped roles.</summary>
    public int? TenantId { get; set; }

    /// <summary>Human-readable description of what this role can do.</summary>
    public string? Description { get; set; }
}
