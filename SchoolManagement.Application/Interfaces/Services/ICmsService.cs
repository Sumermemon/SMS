using SchoolManagement.Application.DTOs.Cms;

namespace SchoolManagement.Application.Interfaces.Services;

public interface ICmsService
{
    Task<PublicCmsSettingsDto> GetPublicSettingsAsync();
    Task<CmsSettingsDto> GetSettingsAsync();
    Task<CmsSettingsDto> UpdateSettingsAsync(UpdateCmsSettingsDto dto, string updatedByUserId);
}
