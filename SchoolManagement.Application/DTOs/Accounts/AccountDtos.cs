using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Application.DTOs.Accounts;

public record FeeListDto(
    int Id,
    int StudentId,
    string StudentName,
    string ClassName,
    string FeeType,
    decimal Amount,
    string DueDate,
    string? PaidDate,
    string Status
);

public record CreateFeeDto(
    int StudentId,
    string FeeType,
    decimal Amount,
    DateOnly DueDate,
    string? Remarks
);

public record UpdateFeeDto(
    string FeeType,
    decimal Amount,
    DateOnly DueDate,
    DateOnly? PaidDate,
    FeeStatus Status,
    string? Remarks
);

public record ExpenseListDto(
    int Id,
    string PhotoUrl,
    string Name,
    string ExpenseType,
    decimal Amount,
    string Status,
    string? Phone,
    string? Email,
    string Date
);

public record CreateExpenseDto(
    string Name,
    string ExpenseType,
    decimal Amount,
    string? Phone,
    string? Email,
    DateOnly Date,
    string? PhotoUrl,
    string? Remarks
);

public record UpdateExpenseDto(
    string Name,
    string ExpenseType,
    decimal Amount,
    ExpenseStatus Status,
    string? Phone,
    string? Email,
    DateOnly Date,
    string? PhotoUrl,
    string? Remarks
);

public record TeacherPaymentDto(
    int Id,
    int TeacherId,
    string TeacherName,
    decimal Amount,
    int Month,
    int Year,
    string Status,
    string? PaidDate,
    string? Notes
);

public record CreateTeacherPaymentDto(
    int TeacherId,
    decimal Amount,
    int Month,
    int Year,
    string? Notes
);

public record UpdateTeacherPaymentDto(
    decimal Amount,
    int Month,
    int Year,
    PaymentStatus Status,
    DateOnly? PaidDate,
    string? Notes
);
