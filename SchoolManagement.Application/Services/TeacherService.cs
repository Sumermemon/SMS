using Microsoft.Extensions.Logging;
using SchoolManagement.Application.DTOs.Common;
using SchoolManagement.Application.DTOs.Teachers;
using SchoolManagement.Application.DTOs.Accounts;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Application.Services;

public class TeacherService : ITeacherService
{
    private readonly ITeacherRepository _repo;
    private readonly ILogger<TeacherService> _logger;

    public TeacherService(ITeacherRepository repo, ILogger<TeacherService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<PagedResult<TeacherListDto>> GetAllAsync(int? subjectId, string? search, int page, int pageSize)
    {
        var all = await _repo.GetAllAsync();
        var filtered = all.Where(t =>
            (subjectId == null || t.SubjectId == subjectId) &&
            (string.IsNullOrWhiteSpace(search) ||
             $"{t.FirstName} {t.LastName}".Contains(search, StringComparison.OrdinalIgnoreCase) ||
             t.Phone.Contains(search)));

        var total = filtered.Count();
        var paged = filtered.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToListDto);
        return new PagedResult<TeacherListDto>(paged, total, page, pageSize);
    }

    public async Task<TeacherDetailDto?> GetByIdAsync(int id)
    {
        var t = await _repo.GetByIdAsync(id);
        return t == null ? null : MapToDetail(t);
    }

    public async Task<TeacherDetailDto> CreateAsync(CreateTeacherDto dto)
    {
        var entity = new Teacher
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Gender = dto.Gender,
            DateOfBirth = dto.DateOfBirth,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            PhotoUrl = dto.PhotoUrl,
            Religion = dto.Religion,
            JoiningDate = dto.JoiningDate,
            SubjectId = dto.SubjectId,
            ClassId = dto.ClassId,
            SectionId = dto.SectionId,
        };
        await _repo.AddAsync(entity);
        var created = await _repo.GetByIdAsync(entity.Id);
        return MapToDetail(created!);
    }

    public async Task<TeacherDetailDto?> UpdateAsync(int id, UpdateTeacherDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.FirstName = dto.FirstName;
        entity.LastName = dto.LastName;
        entity.Gender = dto.Gender;
        entity.DateOfBirth = dto.DateOfBirth;
        entity.Email = dto.Email;
        entity.Phone = dto.Phone;
        entity.Address = dto.Address;
        entity.PhotoUrl = dto.PhotoUrl;
        entity.Religion = dto.Religion;
        entity.JoiningDate = dto.JoiningDate;
        entity.SubjectId = dto.SubjectId;
        entity.ClassId = dto.ClassId;
        entity.SectionId = dto.SectionId;
        await _repo.UpdateAsync(entity);
        var updated = await _repo.GetByIdAsync(id);
        return MapToDetail(updated!);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repo.ExistsAsync(id)) return false;
        await _repo.DeleteAsync(id);
        return true;
    }

    private static TeacherListDto MapToListDto(Teacher t) => new(
        t.Id,
        t.PhotoUrl ?? string.Empty,
        $"{t.FirstName} {t.LastName}",
        t.Gender.ToString(),
        t.Class?.Name,
        t.Subject?.Name,
        t.Section?.Name,
        t.Address,
        t.Phone,
        t.Email,
        t.JoiningDate.ToString("yyyy-MM-dd")
    );

    private static TeacherDetailDto MapToDetail(Teacher t) => new(
        t.Id,
        t.FirstName,
        t.LastName,
        t.Gender.ToString(),
        t.DateOfBirth.ToString("yyyy-MM-dd"),
        t.Email,
        t.Phone,
        t.Address,
        t.PhotoUrl,
        t.Religion,
        t.JoiningDate.ToString("yyyy-MM-dd"),
        t.SubjectId,
        t.Subject?.Name,
        t.ClassId,
        t.Class?.Name,
        t.SectionId,
        t.Section?.Name
    );
}

public class TeacherPaymentService : ITeacherPaymentService
{
    private readonly ITeacherPaymentRepository _repo;

    public TeacherPaymentService(ITeacherPaymentRepository repo) => _repo = repo;

    public async Task<IEnumerable<TeacherPaymentDto>> GetAllAsync()
    {
        var all = await _repo.GetAllAsync();
        return all.Select(MapToDto);
    }

    public async Task<IEnumerable<TeacherPaymentDto>> GetByTeacherIdAsync(int teacherId)
    {
        var all = await _repo.GetByTeacherIdAsync(teacherId);
        return all.Select(MapToDto);
    }

    public async Task<TeacherPaymentDto> CreateAsync(CreateTeacherPaymentDto dto)
    {
        var entity = new TeacherPayment
        {
            TeacherId = dto.TeacherId,
            Amount = dto.Amount,
            Month = dto.Month,
            Year = dto.Year,
            Notes = dto.Notes,
            Status = PaymentStatus.Pending
        };
        await _repo.AddAsync(entity);
        var created = await _repo.GetByIdAsync(entity.Id);
        return MapToDto(created!);
    }

    public async Task<TeacherPaymentDto?> UpdateAsync(int id, UpdateTeacherPaymentDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Amount = dto.Amount;
        entity.Month = dto.Month;
        entity.Year = dto.Year;
        entity.Status = dto.Status;
        entity.PaidDate = dto.PaidDate;
        entity.Notes = dto.Notes;
        await _repo.UpdateAsync(entity);
        var updated = await _repo.GetByIdAsync(id);
        return MapToDto(updated!);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }

    private static TeacherPaymentDto MapToDto(TeacherPayment tp) => new(
        tp.Id,
        tp.TeacherId,
        tp.Teacher != null ? $"{tp.Teacher.FirstName} {tp.Teacher.LastName}" : string.Empty,
        tp.Amount,
        tp.Month,
        tp.Year,
        tp.Status.ToString(),
        tp.PaidDate?.ToString("yyyy-MM-dd"),
        tp.Notes
    );
}
