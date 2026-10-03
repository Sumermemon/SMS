using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Application.DTOs.Teachers;

public record TeacherListDto(
    int Id,
    string PhotoUrl,
    string Name,
    string Gender,
    string? ClassName,
    string? SubjectName,
    string? SectionName,
    string? Address,
    string Phone,
    string Email,
    string JoiningDate,
    List<string>? Subjects = null,
    List<string>? Classes = null,
    List<int>? AssignedSubjectIds = null,
    List<int>? AssignedClassIds = null
);

public record TeacherDetailDto(
    int Id,
    string FirstName,
    string LastName,
    string Gender,
    string DateOfBirth,
    string Email,
    string Phone,
    string? Address,
    string? PhotoUrl,
    string? Religion,
    string JoiningDate,
    int? SubjectId,
    string? SubjectName,
    int? ClassId,
    string? ClassName,
    int? SectionId,
    string? SectionName,
    List<string>? Subjects = null,
    List<string>? Classes = null,
    List<int>? AssignedSubjectIds = null,
    List<int>? AssignedClassIds = null
);

public record CreateTeacherDto(
    string FirstName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    string Email,
    string Phone,
    string? Address,
    string? PhotoUrl,
    string? Religion,
    DateOnly JoiningDate,
    int? SubjectId,
    int? ClassId,
    int? SectionId,
    List<int>? AssignedSubjectIds = null,
    List<int>? AssignedClassIds = null
);

public record UpdateTeacherDto(
    string FirstName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    string Email,
    string Phone,
    string? Address,
    string? PhotoUrl,
    string? Religion,
    DateOnly JoiningDate,
    int? SubjectId,
    int? ClassId,
    int? SectionId,
    List<int>? AssignedSubjectIds = null,
    List<int>? AssignedClassIds = null
);
