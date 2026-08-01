namespace SchoolManagement.Application.DTOs.Parents;

public record ParentDto(
    int Id,
    string Name,
    string Email,
    string Phone,
    string? Address,
    string? Occupation,
    string? PhotoUrl,
    IEnumerable<string> ChildrenNames
);

public record CreateParentDto(
    string Name,
    string Email,
    string Phone,
    string? Address,
    string? Occupation,
    string? PhotoUrl
);

public record UpdateParentDto(
    string Name,
    string Email,
    string Phone,
    string? Address,
    string? Occupation,
    string? PhotoUrl
);
