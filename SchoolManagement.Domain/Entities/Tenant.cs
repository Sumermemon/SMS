namespace SchoolManagement.Domain.Entities;

/// <summary>
/// Represents a school / institution tenant in the multi-tenant system.
/// Each school is a separate tenant with isolated data.
/// </summary>
public class Tenant
{
    public int Id { get; set; }

    /// <summary>Display name of the school.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>URL-friendly unique code, e.g. "bfa" for "Bright Future Academy".</summary>
    public string SlugCode { get; set; } = string.Empty;

    /// <summary>Primary contact email for the school/tenant.</summary>
    public string ContactEmail { get; set; } = string.Empty;

    /// <summary>Phone number for the school.</summary>
    public string? Phone { get; set; }

    /// <summary>School address.</summary>
    public string? Address { get; set; }

    /// <summary>URL to the school logo.</summary>
    public string? LogoUrl { get; set; }

    /// <summary>Whether this tenant is active and can log in.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Optional subscription/plan expiry date for this tenant.</summary>
    public DateTime? PlanExpiryDate { get; set; }

    /// <summary>Last time any user from this tenant logged in.</summary>
    public DateTime? LastLoginAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ── Tenant-Specific SMTP Mail Server Settings ───────────────────────────
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public string? SmtpSenderEmail { get; set; }
    public string? SmtpSenderName { get; set; }
    public bool SmtpEnableSsl { get; set; } = true;

    // Navigation
    public ICollection<TenantPermission> TenantPermissions { get; set; } = new List<TenantPermission>();
}
