namespace SchoolManagement.Application.DTOs.Notices;

public record NoticeDto(
    int Id,
    string Title,
    string Details,
    string PostedBy,
    string Date,
    int ViewCount,
    string CreatedAt,
    string TargetAudience = "Global",
    int? TargetClassId = null,
    string? TargetClassName = null
);

public record CreateNoticeDto(
    string Title,
    string Details,
    string PostedBy,
    DateOnly Date,
    string? TargetAudience = "Global",
    int? TargetClassId = null
);

public record UpdateNoticeDto(
    string Title,
    string Details,
    string PostedBy,
    DateOnly Date,
    string? TargetAudience = "Global",
    int? TargetClassId = null
);
