namespace SchoolManagement.Application.DTOs.Cms;

public record PublicCmsSettingsDto(
    string SiteName,
    string? SiteTagline,
    string? LogoUrl,
    string? ContactEmail,
    string? ContactPhone,
    string? Address,
    string? FooterText,
    string? FacebookUrl,
    string? TwitterUrl,
    string? InstagramUrl,
    string? LinkedInUrl,
    string? YouTubeUrl,
    string? GitHubUrl
);

public record CmsSettingsDto(
    int Id,
    string SiteName,
    string? SiteTagline,
    string? LogoUrl,
    string? ContactEmail,
    string? ContactPhone,
    string? Address,
    string? FooterText,
    string? FacebookUrl,
    string? TwitterUrl,
    string? InstagramUrl,
    string? LinkedInUrl,
    string? YouTubeUrl,
    string? GitHubUrl,
    string? SmtpHost,
    int SmtpPort,
    string? SmtpUsername,
    string? SmtpPassword,
    string? SmtpSenderEmail,
    string? SmtpSenderName,
    bool SmtpEnableSsl,
    DateTime UpdatedAt,
    string? UpdatedBy
);

public record UpdateCmsSettingsDto(
    string SiteName,
    string? SiteTagline,
    string? LogoUrl,
    string? ContactEmail,
    string? ContactPhone,
    string? Address,
    string? FooterText,
    string? FacebookUrl,
    string? TwitterUrl,
    string? InstagramUrl,
    string? LinkedInUrl,
    string? YouTubeUrl,
    string? GitHubUrl,
    string? SmtpHost,
    int SmtpPort,
    string? SmtpUsername,
    string? SmtpPassword,
    string? SmtpSenderEmail,
    string? SmtpSenderName,
    bool SmtpEnableSsl
);
