using System.Net;
using System.Security.Claims;
using System.Text.Json;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;

namespace SchoolManagement.API.Middleware;

/// <summary>
/// Global exception handler that catches all unhandled exceptions, logs them to the
/// ExceptionLogs table, and returns a clean JSON error response.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IServiceScopeFactory scopeFactory)
    {
        _next        = next;
        _logger      = logger;
        _scopeFactory = scopeFactory;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception on {Method} {Path}", ctx.Request.Method, ctx.Request.Path);
            await LogToDatabase(ex, ctx);
            await WriteErrorResponse(ctx, ex);
        }
    }

    private async Task LogToDatabase(Exception ex, HttpContext ctx)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var userId   = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? ctx.User.FindFirstValue("sub");
            var tenantId = ctx.User.FindFirstValue("tenantId") is string tid && int.TryParse(tid, out var t) ? (int?)t : null;

            db.ExceptionLogs.Add(new ExceptionLog
            {
                Message       = ex.Message,
                StackTrace    = ex.StackTrace,
                Source        = ex.Source,
                RequestPath   = ctx.Request.Path,
                RequestMethod = ctx.Request.Method,
                UserId        = userId,
                TenantId      = tenantId,
                Severity      = ex is OutOfMemoryException or StackOverflowException ? "Critical" : "Error",
                OccurredAt    = DateTime.UtcNow
            });

            await db.SaveChangesAsync();
        }
        catch (Exception logEx)
        {
            _logger.LogError(logEx, "Failed to persist exception log to database.");
        }
    }

    private static async Task WriteErrorResponse(HttpContext ctx, Exception ex)
    {
        ctx.Response.StatusCode  = (int)HttpStatusCode.InternalServerError;
        ctx.Response.ContentType = "application/json";

        var response = new
        {
            message = "An unexpected error occurred. Our team has been notified.",
            detail  = ex.Message // Remove this in production if you don't want to expose details
        };

        await ctx.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
