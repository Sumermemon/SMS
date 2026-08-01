using SchoolManagement.Domain.Common;
using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Domain.Entities;

public class Fee : BaseEntity
{
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public string FeeType { get; set; } = string.Empty;  // Tuition, Transport, Exam, etc.
    public decimal Amount { get; set; }
    public DateOnly DueDate { get; set; }
    public DateOnly? PaidDate { get; set; }
    public FeeStatus Status { get; set; } = FeeStatus.Due;
    public string? Remarks { get; set; }
}
