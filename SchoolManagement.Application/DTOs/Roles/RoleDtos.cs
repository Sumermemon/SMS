namespace SchoolManagement.Application.DTOs.Roles;

public record RoleDto(
    string Id,
    string Name,
    string DisplayName,
    string? Description,
    int TenantId,
    IList<string> Permissions
);

public record CreateRoleDto(
    string Name,
    string? Description,
    List<string> Permissions
);

public record UpdateRoleDto(
    string? Description,
    List<string> Permissions
);
