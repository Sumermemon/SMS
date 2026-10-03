using Microsoft.AspNetCore.Identity;
using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Infrastructure.Identity;

/// <summary>
/// Extended IdentityUser with multi-tenant support.
/// SuperAdmin users have TenantId = null and IsSuperAdmin = true.
/// All other users are scoped to a specific tenant.
/// </summary>
public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? PhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // ── Multi-Tenant Fields ───────────────────────────────────────────────────
    /// <summary>
    /// Null for SuperAdmin; set for all tenant-scoped users.
    /// </summary>
    public int? TenantId { get; set; }

    /// <summary>
    /// True only for the platform-level SuperAdmin.
    /// SuperAdmin bypasses all tenant checks.
    /// </summary>
    public bool IsSuperAdmin { get; set; } = false;
}
