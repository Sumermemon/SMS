namespace SchoolManagement.Domain.Entities;

/// <summary>
/// Junction table: which permissions are enabled for a tenant.
/// SuperAdmin grants/revokes permissions per tenant.
/// </summary>
public class TenantPermission
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public int PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;

    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    public string GrantedBy { get; set; } = string.Empty; // UserId of SuperAdmin
}
