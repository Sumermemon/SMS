namespace SchoolManagement.Domain.Entities;

/// <summary>
/// Platform-wide CMS and system configuration managed exclusively by SuperAdmin.
/// Contains site branding, public social links, and SMTP mail server settings.
/// </summary>
public class SystemSetting
{
    public int Id { get; set; }

    // ── General / Branding ──────────────────────────────────────────────────
    public string SiteName { get; set; } = "EduManage";
    public string? SiteTagline { get; set; } = "School Management Platform";
    public string? LogoUrl { get; set; }
    public string? ContactEmail { get; set; } = "info@edumanage.com";
    public string? ContactPhone { get; set; } = "+1 (800) 555-0199";
    public string? Address { get; set; } = "100 Innovation Way, Suite 400";
    public string? FooterText { get; set; } = "© 2026 EduManage. All rights reserved.";

    // ── Social Media Links ──────────────────────────────────────────────────
    public string? FacebookUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? YouTubeUrl { get; set; }
    public string? GitHubUrl { get; set; }

    // ── SMTP Server Details ─────────────────────────────────────────────────
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public string? SmtpSenderEmail { get; set; }
    public string? SmtpSenderName { get; set; } = "EduManage Notifications";
    public bool SmtpEnableSsl { get; set; } = true;

    // ── Audit ───────────────────────────────────────────────────────────────
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
}
