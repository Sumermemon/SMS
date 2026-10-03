using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;

namespace SchoolManagement.API.Controllers;

/// <summary>
/// Exception log management — SuperAdmin only.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdminOnly")]
public class ExceptionLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExceptionLogsController(AppDbContext db) => _db = db;

    /// <summary>Get paginated exception logs.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? severity = null,
        [FromQuery] bool? isResolved = null)
    {
        var query = _db.ExceptionLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(severity))
            query = query.Where(e => e.Severity == severity);
        if (isResolved.HasValue)
            query = query.Where(e => e.IsResolved == isResolved.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(e => e.OccurredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new {
                e.Id, e.Message, e.Source, e.RequestPath, e.RequestMethod,
                e.UserId, e.TenantId, e.Severity, e.OccurredAt, e.IsResolved, e.ResolvedNote
            })
            .ToListAsync();

        return Ok(new { data = items, total, page, pageSize });
    }

    /// <summary>Get a specific exception log with full stack trace.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var log = await _db.ExceptionLogs.FindAsync(id);
        return log == null ? NotFound() : Ok(log);
    }

    /// <summary>Mark an exception as resolved with an optional note.</summary>
    [HttpPatch("{id:int}/resolve")]
    public async Task<IActionResult> Resolve(int id, [FromBody] ResolveExceptionDto dto)
    {
        var log = await _db.ExceptionLogs.FindAsync(id);
        if (log == null) return NotFound();
        log.IsResolved   = true;
        log.ResolvedNote = dto.Note;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Marked as resolved." });
    }

    /// <summary>Delete all resolved exception logs (cleanup).</summary>
    [HttpDelete("resolved")]
    public async Task<IActionResult> ClearResolved()
    {
        var resolved = await _db.ExceptionLogs.Where(e => e.IsResolved).ToListAsync();
        _db.ExceptionLogs.RemoveRange(resolved);
        await _db.SaveChangesAsync();
        return Ok(new { deleted = resolved.Count });
    }
}

public record ResolveExceptionDto(string? Note);
