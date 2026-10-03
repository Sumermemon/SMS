using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagement.Application.DTOs.Cms;
using SchoolManagement.Application.Interfaces.Services;

namespace SchoolManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CmsController : ControllerBase
{
    private readonly ICmsService _cmsService;

    public CmsController(ICmsService cmsService)
    {
        _cmsService = cmsService;
    }

    /// <summary>
    /// Public endpoint for retrieving site branding and available social media links.
    /// Accessible without authentication for landing/login pages and site footers.
    /// </summary>
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<PublicCmsSettingsDto>> GetPublicSettings()
    {
        var settings = await _cmsService.GetPublicSettingsAsync();
        return Ok(settings);
    }

    /// <summary>
    /// Admin endpoint for retrieving complete CMS, branding, social links, and SMTP details.
    /// Restricted to SuperAdmin platform administrators.
    /// </summary>
    [HttpGet("settings")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<CmsSettingsDto>> GetSettings()
    {
        var settings = await _cmsService.GetSettingsAsync();
        return Ok(settings);
    }

    /// <summary>
    /// Admin endpoint for updating CMS branding, social links, and SMTP credentials.
    /// Restricted to SuperAdmin platform administrators.
    /// </summary>
    [HttpPut("settings")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<CmsSettingsDto>> UpdateSettings([FromBody] UpdateCmsSettingsDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub")
                  ?? "superadmin";

        var updated = await _cmsService.UpdateSettingsAsync(dto, userId);
        return Ok(updated);
    }
}
