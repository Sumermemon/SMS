namespace SchoolManagement.Application.DTOs.Dashboard;

public record AdminDashboardDto(
    int TotalStudents,
    int TotalTeachers,
    int TotalParents,
    int TotalClasses,
    decimal TotalFeesCollected,
    decimal TotalExpenses,
    int TotalNotices,
    IEnumerable<MonthlyStatDto> MonthlyFees,
    IEnumerable<MonthlyStatDto> MonthlyExpenses,
    IEnumerable<RecentNoticeDto> RecentNotices,
    IEnumerable<UpcomingExamDto> UpcomingExams
);

public record TeacherDashboardDto(
    int TotalStudentsTaught,
    int ClassesAssigned,
    int TotalSubjects,
    IEnumerable<StudentSummaryDto> MyStudents,
    IEnumerable<RecentNoticeDto> Notifications
);

public record StudentDashboardDto(
    int TotalExams,
    double AttendancePercentage,
    string PerformanceIndicator,
    IEnumerable<ExamResultSummaryDto> ExamResults,
    IEnumerable<RecentNoticeDto> Notifications
);

public record ParentDashboardDto(
    decimal FeeDueAmount,
    int NumberOfChildren,
    int TotalNotices,
    decimal TotalFeesPaid,
    IEnumerable<ChildSummaryDto> Children,
    IEnumerable<ExpenseSummaryDto> RecentExpenses,
    IEnumerable<ExamResultSummaryDto> ExamResults,
    IEnumerable<RecentNoticeDto> Notifications
);

public record MonthlyStatDto(string Month, decimal Amount);
public record RecentNoticeDto(int Id, string Title, string PostedBy, string Date);
public record UpcomingExamDto(int Id, string ExamName, string SubjectName, string ClassName, string Date);
public record StudentSummaryDto(int Id, string Name, string ClassName, int Roll);
public record ExamResultSummaryDto(string SubjectName, string ExamName, decimal Marks, string Grade);
public record ChildSummaryDto(int Id, string Name, string ClassName, string SectionName, int Roll, string? PhotoUrl);
public record ExpenseSummaryDto(string Name, decimal Amount, string Status, string Date);
