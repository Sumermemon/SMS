using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Application.DTOs.Users;

public record UserDto(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    UserRole Role,
    string? PhotoUrl,
    bool IsActive,
    int? TenantId,
    bool IsSuperAdmin,
    DateTime CreatedAt,
    IList<string> Roles
);

public record CreateUserDto(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    UserRole Role,
    string? PhotoUrl,
    string RoleName        // The AppRole to assign (e.g. "T1_ClassTeacher")
);

public record UpdateUserDto(
    string FirstName,
    string LastName,
    string? PhotoUrl,
    bool IsActive
);

public record AssignRoleDto(
    string RoleName
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);
