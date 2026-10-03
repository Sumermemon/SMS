namespace SchoolManagement.Infrastructure.Identity;

/// <summary>
/// Resolves the current tenant from the authenticated user's JWT claims.
/// Injected into DbContext to enforce global query filters.
/// </summary>
public interface ITenantContext
{
    /// <summary>Current tenant's ID. Returns 0 if user is SuperAdmin (no tenant scope).</summary>
    int TenantId { get; }

    /// <summary>True if the current user is a SuperAdmin (bypasses tenant filtering).</summary>
    bool IsSuperAdmin { get; }
}
