namespace SchoolManagement.Infrastructure.StoredProcedures;

/// <summary>Keyless DTO mapped to get_all_students stored procedure results.</summary>
public class StudentListResult
{
    public int Id { get; set; }
    public int Roll { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

/// <summary>Keyless DTO mapped to get_all_teachers stored procedure results.</summary>
public class TeacherListResult
{
    public int Id { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string? ClassName { get; set; }
    public string? SubjectName { get; set; }
    public string? SectionName { get; set; }
    public string? Address { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

/// <summary>Keyless DTO mapped to get_class_routine stored procedure results.</summary>
public class RoutineListResult
{
    public int Id { get; set; }
    public string Day { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string? TeacherName { get; set; }
    public string TimeSlot { get; set; } = string.Empty;
    public DateOnly? EffectiveDate { get; set; }
}

/// <summary>Keyless DTO mapped to get_exam_schedule stored procedure results.</summary>
public class ExamScheduleResult
{
    public int Id { get; set; }
    public string ExamName { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string ExamTime { get; set; } = string.Empty;
    public DateOnly ExamDate { get; set; }
    public bool IsPublished { get; set; }
}

/// <summary>Keyless DTO mapped to get_attendance_sheet stored procedure results (one row per student per day).</summary>
public class AttendanceSheetResult
{
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Roll { get; set; } = string.Empty;
    public int DayOfMonth { get; set; }
    public bool? IsPresent { get; set; }
}

/// <summary>Keyless DTO mapped to get_all_expenses stored procedure results.</summary>
public class ExpenseListResult
{
    public int Id { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ExpenseType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateOnly Date { get; set; }
}

/// <summary>Keyless DTO mapped to get_all_fees stored procedure results.</summary>
public class FeeListResult
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string FeeType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly DueDate { get; set; }
    public DateOnly? PaidDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
