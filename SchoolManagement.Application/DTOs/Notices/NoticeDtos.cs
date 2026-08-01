namespace SchoolManagement.Application.DTOs.Notices;

public record NoticeDto(
    int Id,
    string Title,
    string Details,
    string PostedBy,
    string Date,
    int ViewCount,
    string CreatedAt
);

public record CreateNoticeDto(
    string Title,
    string Details,
    string PostedBy,
    DateOnly Date
);

public record UpdateNoticeDto(
    string Title,
    string Details,
    string PostedBy,
    DateOnly Date
);
