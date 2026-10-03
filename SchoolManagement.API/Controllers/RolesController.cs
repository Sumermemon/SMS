using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagement.Application.DTOs.Roles;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.API.Controllers;

/// <summary>
/// Tenant-scoped role management. Callable by tenant Admins (users.create permission) or SuperAdmin.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IRoleService _service;
    private readonly ITenantContext _tenantContext;

    public RolesController(IRoleService service, ITenantContext tenantContext)
    {
        _service = service;
        _tenantContext = tenantContext;
    }

    /// <summary>List all roles for the current tenant.</summary>
    [HttpGet]
    [Authorize(Policy = "roles.view")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync(_tenantContext.TenantId));

    /// <summary>Get a specific role by ID.</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "roles.view")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _service.GetByIdAsync(id, _tenantContext.TenantId);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Create a new role for the current tenant.</summary>
    [HttpPost]
    [Authorize(Policy = "roles.create")]
    public async Task<IActionResult> Create([FromBody] CreateRoleDto dto)
    {
        var result = await _service.CreateAsync(_tenantContext.TenantId, dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update a role's description and permissions.</summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "roles.edit")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateRoleDto dto)
    {
        var result = await _service.UpdateAsync(id, _tenantContext.TenantId, dto);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Delete a role from the current tenant.</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "roles.delete")]
    public async Task<IActionResult> Delete(string id)
        => await _service.DeleteAsync(id, _tenantContext.TenantId) ? NoContent() : NotFound();
}
