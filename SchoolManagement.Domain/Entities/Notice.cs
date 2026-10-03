using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class Notice : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string PostedBy { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public int ViewCount { get; set; } = 0;

    /// <summary>
    /// Audience scope: "Global", "ClassWise", "Parents", "Teachers", "Students".
    /// </summary>
    public string TargetAudience { get; set; } = "Global";

    /// <summary>
    /// Optional target class for class-wise notices.
    /// </summary>
    public int? TargetClassId { get; set; }
    public Class? TargetClass { get; set; }
}
