namespace SchoolManagement.Domain.Common;

public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Multi-tenant isolation column.
    /// All queries are automatically filtered by TenantId via global query filters.
    /// </summary>
    public int TenantId { get; set; }
}
