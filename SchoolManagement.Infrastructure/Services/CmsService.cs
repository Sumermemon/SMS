using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.DTOs.Cms;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;

namespace SchoolManagement.Infrastructure.Services;

public class CmsService : ICmsService
{
    private readonly AppDbContext _db;

    public CmsService(AppDbContext db)
    {
        _db = db;
    }

    private async Task<SystemSetting> GetOrCreateSettingsEntityAsync()
    {
        var settings = await _db.SystemSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new SystemSetting();
            _db.SystemSettings.Add(settings);
            await _db.SaveChangesAsync();
        }
        return settings;
    }

    public async Task<PublicCmsSettingsDto> GetPublicSettingsAsync()
    {
        var s = await GetOrCreateSettingsEntityAsync();
        return new PublicCmsSettingsDto(
            s.SiteName,
            s.SiteTagline,
            s.LogoUrl,
            s.ContactEmail,
            s.ContactPhone,
            s.Address,
            s.FooterText,
            s.FacebookUrl,
            s.TwitterUrl,
            s.InstagramUrl,
            s.LinkedInUrl,
            s.YouTubeUrl,
            s.GitHubUrl
        );
    }

    public async Task<CmsSettingsDto> GetSettingsAsync()
    {
        var s = await GetOrCreateSettingsEntityAsync();
        return MapToDto(s);
    }

    public async Task<CmsSettingsDto> UpdateSettingsAsync(UpdateCmsSettingsDto dto, string updatedByUserId)
    {
        var s = await GetOrCreateSettingsEntityAsync();

        s.SiteName = dto.SiteName;
        s.SiteTagline = dto.SiteTagline;
        s.LogoUrl = dto.LogoUrl;
        s.ContactEmail = dto.ContactEmail;
        s.ContactPhone = dto.ContactPhone;
        s.Address = dto.Address;
        s.FooterText = dto.FooterText;

        s.FacebookUrl = dto.FacebookUrl;
        s.TwitterUrl = dto.TwitterUrl;
        s.InstagramUrl = dto.InstagramUrl;
        s.LinkedInUrl = dto.LinkedInUrl;
        s.YouTubeUrl = dto.YouTubeUrl;
        s.GitHubUrl = dto.GitHubUrl;

        s.SmtpHost = dto.SmtpHost;
        s.SmtpPort = dto.SmtpPort;
        s.SmtpUsername = dto.SmtpUsername;
        s.SmtpPassword = dto.SmtpPassword;
        s.SmtpSenderEmail = dto.SmtpSenderEmail;
        s.SmtpSenderName = dto.SmtpSenderName;
        s.SmtpEnableSsl = dto.SmtpEnableSsl;

        s.UpdatedAt = DateTime.UtcNow;
        s.UpdatedBy = updatedByUserId;

        await _db.SaveChangesAsync();
        return MapToDto(s);
    }

    private static CmsSettingsDto MapToDto(SystemSetting s) => new(
        s.Id,
        s.SiteName,
        s.SiteTagline,
        s.LogoUrl,
        s.ContactEmail,
        s.ContactPhone,
        s.Address,
        s.FooterText,
        s.FacebookUrl,
        s.TwitterUrl,
        s.InstagramUrl,
        s.LinkedInUrl,
        s.YouTubeUrl,
        s.GitHubUrl,
        s.SmtpHost,
        s.SmtpPort,
        s.SmtpUsername,
        s.SmtpPassword,
        s.SmtpSenderEmail,
        s.SmtpSenderName,
        s.SmtpEnableSsl,
        s.UpdatedAt,
        s.UpdatedBy
    );
}
