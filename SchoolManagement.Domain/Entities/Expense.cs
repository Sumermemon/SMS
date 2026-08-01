using SchoolManagement.Domain.Common;
using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Domain.Entities;

public class Expense : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ExpenseType { get; set; } = string.Empty;  // Salary, Utilities, Transport, etc.
    public decimal Amount { get; set; }
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Pending;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateOnly Date { get; set; }
    public string? PhotoUrl { get; set; }
    public string? StaffUserId { get; set; }
    public string? Remarks { get; set; }
}
