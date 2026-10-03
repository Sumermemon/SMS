using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Application.DTOs.Students;

public record StudentListDto(
    int Id,
    int Roll,
    string PhotoUrl,
    string Name,
    string Gender,
    string ClassName,
    string SectionName,
    string ParentName,
    string Address,
    DateOnly DateOfBirth,
    string Phone,
    string Email,
    int? ClassId = null,
    int? SectionId = null
);

public record StudentDetailDto(
    int Id,
    string FirstName,
    string LastName,
    string Gender,
    string DateOfBirth,
    int Roll,
    string BloodGroup,
    string? Religion,
    string Email,
    string Phone,
    string? Address,
    string? PhotoUrl,
    string? AdmissionId,
    string? ShortBio,
    string AdmissionDate,
    int ClassId,
    string ClassName,
    int SectionId,
    string SectionName,
    int? ParentId,
    string? ParentName,
    string? FatherName,
    string? MotherName
);

public record CreateStudentDto(
    string FirstName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    int Roll,
    BloodGroup BloodGroup,
    string? Religion,
    string Email,
    string Phone,
    string? Address,
    string? PhotoUrl,
    string? AdmissionId,
    string? ShortBio,
    DateOnly AdmissionDate,
    int ClassId,
    int SectionId,
    int? ParentId
);

public record UpdateStudentDto(
    string FirstName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    int Roll,
    BloodGroup BloodGroup,
    string? Religion,
    string Email,
    string Phone,
    string? Address,
    string? PhotoUrl,
    string? AdmissionId,
    string? ShortBio,
    int ClassId,
    int SectionId,
    int? ParentId
);

public record PromoteStudentDto(
    int FromClassId,
    int FromSectionId,
    int ToClassId,
    int ToSectionId
);
