namespace SchoolManagement.Domain.Entities;

/// <summary>
/// A granular permission that can be assigned to roles.
/// e.g. "students.create", "fees.view", "tenants.manage"
/// </summary>
public class Permission
{
    public int Id { get; set; }

    /// <summary>System key, e.g. "students.create".</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Human-readable label, e.g. "Create Students".</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Logical grouping, e.g. "Students", "Finance".</summary>
    public string Module { get; set; } = string.Empty;

    // Navigation
    public ICollection<TenantPermission> TenantPermissions { get; set; } = new List<TenantPermission>();
}
