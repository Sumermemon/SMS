using SchoolManagement.Domain.Common;
using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Domain.Entities;

public class TeacherPayment : BaseEntity
{
    public int TeacherId { get; set; }
    public Teacher Teacher { get; set; } = null!;
    public decimal Amount { get; set; }
    public int Month { get; set; }   // 1–12
    public int Year { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateOnly? PaidDate { get; set; }
    public string? Notes { get; set; }
}
