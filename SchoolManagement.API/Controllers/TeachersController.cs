using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagement.Application.DTOs.Teachers;
using SchoolManagement.Application.DTOs.Accounts;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeachersController : ControllerBase
{
    private readonly ITeacherService _service;
    public TeachersController(ITeacherService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = Permissions.Teachers.View)]
    public async Task<IActionResult> GetAll([FromQuery] int? subjectId, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _service.GetAllAsync(subjectId, search, page, pageSize));

    [HttpGet("{id:int}")]
    [Authorize(Policy = Permissions.Teachers.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.Teachers.Create)]
    public async Task<IActionResult> Create([FromBody] CreateTeacherDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Permissions.Teachers.Edit)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeacherDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Permissions.Teachers.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}

[ApiController]
[Route("api/teacher-payments")]
[Authorize]
public class TeacherPaymentsController : ControllerBase
{
    private readonly ITeacherPaymentService _service;
    public TeacherPaymentsController(ITeacherPaymentService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = Permissions.Expenses.View)]
    public async Task<IActionResult> GetAll([FromQuery] int? teacherId)
    {
        var result = teacherId.HasValue ? await _service.GetByTeacherIdAsync(teacherId.Value) : await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.Expenses.Create)]
    public async Task<IActionResult> Create([FromBody] CreateTeacherPaymentDto dto) => Ok(await _service.CreateAsync(dto));

    [HttpPut("{id:int}")]
    [Authorize(Policy = Permissions.Expenses.Edit)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeacherPaymentDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Permissions.Expenses.Delete)]
    public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
