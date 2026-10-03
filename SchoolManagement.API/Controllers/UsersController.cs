using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagement.Application.DTOs.Users;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.API.Controllers;

/// <summary>
/// User management within a tenant. Callable by tenant Admins or SuperAdmin.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _service;
    private readonly ITenantContext _tenantContext;

    public UsersController(IUserManagementService service, ITenantContext tenantContext)
    {
        _service = service;
        _tenantContext = tenantContext;
    }

    /// <summary>List all users in the current tenant.</summary>
    [HttpGet]
    [Authorize(Policy = "users.view")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync(_tenantContext.TenantId));

    /// <summary>Get a specific user by ID.</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "users.view")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _service.GetByIdAsync(id, _tenantContext.TenantId);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Create a new user in the current tenant and assign a role.</summary>
    [HttpPost]
    [Authorize(Policy = "users.create")]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var result = await _service.CreateAsync(_tenantContext.TenantId, dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update a user's profile.</summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "users.edit")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDto dto)
    {
        var result = await _service.UpdateAsync(id, _tenantContext.TenantId, dto);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Deactivate a user (soft-disable).</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "users.delete")]
    public async Task<IActionResult> Deactivate(string id)
        => await _service.DeactivateAsync(id, _tenantContext.TenantId) ? NoContent() : NotFound();

    /// <summary>Reassign a user to a different role within the same tenant.</summary>
    [HttpPost("{id}/role")]
    [Authorize(Policy = "users.edit")]
    public async Task<IActionResult> AssignRole(string id, [FromBody] AssignRoleDto dto)
    {
        var result = await _service.AssignRoleAsync(id, _tenantContext.TenantId, dto);
        return result ? Ok(new { message = "Role assigned successfully." }) : NotFound();
    }
}
