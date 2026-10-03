namespace SchoolManagement.Domain.Common;

/// <summary>
/// Constants for platform-level and system roles.
/// Clearly separated from custom tenant roles created dynamically by schools.
/// </summary>
public static class SystemRoles
{
    /// <summary>
    /// Global system super administrator with unrestricted cross-tenant and platform access.
    /// </summary>
    public const string SuperAdmin = "SuperAdmin";

    /// <summary>
    /// Administrative user for a specific tenant, provisioned by SuperAdmin.
    /// Operates exclusively within their own tenant.
    /// </summary>
    public const string TenantAdmin = "TenantAdmin";

    /// <summary>
    /// Legacy alias kept for backwards compatibility.
    /// </summary>
    public const string Admin = "Admin";

    public static bool IsSystemRole(string roleName) =>
        roleName.Equals(SuperAdmin, StringComparison.OrdinalIgnoreCase) ||
        roleName.Equals(TenantAdmin, StringComparison.OrdinalIgnoreCase) ||
        roleName.Equals(Admin, StringComparison.OrdinalIgnoreCase);
}
