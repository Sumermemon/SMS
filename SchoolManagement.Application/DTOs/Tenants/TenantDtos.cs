namespace SchoolManagement.Application.DTOs.Tenants;

public record TenantDto(
    int Id,
    string Name,
    string SlugCode,
    string ContactEmail,
    string? Phone,
    string? Address,
    string? LogoUrl,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? PlanExpiryDate,
    DateTime? LastLoginAt,
    int PermissionCount,
    int StudentCount,
    int TeacherCount,
    string? SmtpHost = null,
    int? SmtpPort = 587,
    string? SmtpUsername = null,
    string? SmtpPassword = null,
    string? SmtpSenderEmail = null,
    string? SmtpSenderName = null,
    bool? SmtpEnableSsl = true
);

public record CreateTenantDto(
    string Name,
    string SlugCode,
    string ContactEmail,
    string AdminPassword,
    string? Phone,
    string? Address,
    string? LogoUrl,
    DateTime? PlanExpiryDate,
    string? SmtpHost = null,
    int? SmtpPort = 587,
    string? SmtpUsername = null,
    string? SmtpPassword = null,
    string? SmtpSenderEmail = null,
    string? SmtpSenderName = null,
    bool? SmtpEnableSsl = true
);


public record UpdateTenantDto(
    string Name,
    string ContactEmail,
    string? Phone,
    string? Address,
    string? LogoUrl,
    bool IsActive,
    DateTime? PlanExpiryDate,
    string? SmtpHost = null,
    int? SmtpPort = 587,
    string? SmtpUsername = null,
    string? SmtpPassword = null,
    string? SmtpSenderEmail = null,
    string? SmtpSenderName = null,
    bool? SmtpEnableSsl = true
);

public record GrantTenantPermissionsDto(
    List<string> PermissionNames
);

public record TenantPermissionDto(
    int PermissionId,
    string Name,
    string DisplayName,
    string Module,
    DateTime GrantedAt
);

public record SuperAdminStatsDto(
    int TotalTenants,
    int ActiveTenants,
    int InactiveTenants,
    int ExpiringWithin30Days,
    int TotalStudents,
    int TotalTeachers,
    int TotalUsers
);
