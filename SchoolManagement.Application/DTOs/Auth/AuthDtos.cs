using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Application.DTOs.Auth;

public record LoginDto(string Email, string Password);

public record RegisterDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    UserRole Role
);

public record AuthResponseDto(
    string Token,
    string RefreshToken,
    string Email,
    string FullName,
    string Role,
    string UserId,
    int? TenantId,
    bool IsSuperAdmin
);

public record RefreshTokenDto(string Token, string RefreshToken);

public record UserDto(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    string? PhotoUrl,
    string CreatedAt
);

public record CreateUserDto(
    string FirstName,
    string LastName,
    UserRole Role,
    string Gender,
    string? FatherName,
    string? MotherName,
    DateOnly? DateOfBirth,
    string? Religion,
    DateOnly? JoiningDate,
    string Email,
    string Password,
    int? SubjectId,
    int? ClassId,
    int? SectionId,
    string? IdNo,
    string? Phone,
    string? Address
);
