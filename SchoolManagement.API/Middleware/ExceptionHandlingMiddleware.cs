using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;

namespace SchoolManagement.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IServiceScopeFactory scopeFactory)
    {
        _next        = next;
        _logger      = logger;
        _scopeFactory = scopeFactory;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found");
            await WriteErrorAsync(context, HttpStatusCode.NotFound, ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation");
            await WriteErrorAsync(context, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized");
            await WriteErrorAsync(context, HttpStatusCode.Unauthorized, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception on {Method} {Path}",
                context.Request.Method, context.Request.Path);

            // Persist to ExceptionLogs table for SuperAdmin visibility
            await PersistExceptionAsync(ex, context);

            await WriteErrorAsync(context, HttpStatusCode.InternalServerError,
                "An unexpected error occurred.");
        }
    }

    private async Task PersistExceptionAsync(Exception ex, HttpContext ctx)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var userId   = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? ctx.User.FindFirstValue("sub");
            var tenantId = ctx.User.FindFirstValue("tenantId") is string tid
                        && int.TryParse(tid, out var t) ? (int?)t : null;

            db.ExceptionLogs.Add(new ExceptionLog
            {
                Message       = ex.Message,
                StackTrace    = ex.StackTrace,
                Source        = ex.Source,
                RequestPath   = ctx.Request.Path,
                RequestMethod = ctx.Request.Method,
                UserId        = userId,
                TenantId      = tenantId,
                Severity      = ex is OutOfMemoryException or StackOverflowException
                                ? "Critical" : "Error",
                OccurredAt    = DateTime.UtcNow
            });

            await db.SaveChangesAsync();
        }
        catch (Exception logEx)
        {
            _logger.LogError(logEx, "Failed to persist exception log to DB.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode status, string message)
    {
        context.Response.StatusCode  = (int)status;
        context.Response.ContentType = "application/json";
        var body = JsonSerializer.Serialize(new ProblemDetails
        {
            Status = (int)status,
            Title  = status.ToString(),
            Detail = message
        });
        await context.Response.WriteAsync(body);
    }
}
