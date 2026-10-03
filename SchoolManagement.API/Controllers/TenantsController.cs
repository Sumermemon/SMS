using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagement.Application.DTOs.Tenants;
using SchoolManagement.Application.Interfaces.Services;

namespace SchoolManagement.API.Controllers;

/// <summary>
/// Tenant management — SuperAdmin only.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdminOnly")]
public class TenantsController : ControllerBase
{
    private readonly ITenantService _service;

    public TenantsController(ITenantService service) => _service = service;

    /// <summary>List all tenants (schools).</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    /// <summary>Get platform-wide stats for the SuperAdmin dashboard.</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats() => Ok(await _service.GetStatsAsync());

    /// <summary>Get a specific tenant by ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Create a new tenant (school).</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTenantDto dto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value ?? string.Empty;
        var result = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update tenant details.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTenantDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Deactivate a tenant (soft-disable, does not delete data).</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deactivate(int id)
        => await _service.DeactivateAsync(id) ? NoContent() : NotFound();

    // ── Permission Management ──────────────────────────────────────────────────

    /// <summary>Get all permissions granted to a tenant.</summary>
    [HttpGet("{id:int}/permissions")]
    public async Task<IActionResult> GetPermissions(int id)
        => Ok(await _service.GetPermissionsAsync(id));

    /// <summary>Grant or update (synchronize) permissions for a tenant.</summary>
    [HttpPut("{id:int}/permissions")]
    [HttpPost("{id:int}/permissions")]
    public async Task<IActionResult> SetPermissions(int id, [FromBody] GrantTenantPermissionsDto dto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value ?? string.Empty;
        await _service.SetPermissionsAsync(id, dto, userId);
        return Ok(new { message = "Tenant permissions updated successfully." });
    }

    /// <summary>Revoke a specific permission from a tenant.</summary>
    [HttpDelete("{id:int}/permissions/{permissionName}")]
    public async Task<IActionResult> RevokePermission(int id, string permissionName)
    {
        await _service.RevokePermissionAsync(id, permissionName);
        return NoContent();
    }
}
