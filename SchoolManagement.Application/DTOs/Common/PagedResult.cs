namespace SchoolManagement.Application.DTOs.Common;

public record PagedResult<T>(
    IEnumerable<T> Data,
    int Total,
    int Page,
    int PageSize
);
