namespace SchoolManagement.Domain.Entities;

/// <summary>
/// Stores unhandled/caught exceptions from the application for SuperAdmin review.
/// </summary>
public class ExceptionLog
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? StackTrace { get; set; }
    public string? Source { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }
    public string? UserId { get; set; }
    public int? TenantId { get; set; }
    public string Severity { get; set; } = "Error"; // Error, Warning, Critical
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public bool IsResolved { get; set; } = false;
    public string? ResolvedNote { get; set; }
}
