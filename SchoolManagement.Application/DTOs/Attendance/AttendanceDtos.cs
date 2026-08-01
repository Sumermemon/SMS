namespace SchoolManagement.Application.DTOs.Attendance;

public record AttendanceSheetDto(
    int StudentId,
    string StudentName,
    string Roll,
    Dictionary<int, bool?> DayStatus   // day-of-month -> present/absent/null(not marked)
);

public record MarkAttendanceDto(
    int ClassId,
    int SectionId,
    DateOnly Date,
    IEnumerable<StudentAttendanceEntry> Entries
);

public record StudentAttendanceEntry(int StudentId, bool IsPresent, string? Remarks);

public record AttendanceDto(
    int Id,
    int StudentId,
    string StudentName,
    int ClassId,
    string ClassName,
    int SectionId,
    string SectionName,
    DateOnly Date,
    bool IsPresent,
    string? Remarks
);
