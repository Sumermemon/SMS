using Microsoft.Extensions.Logging;
using SchoolManagement.Application.DTOs.Common;
using SchoolManagement.Application.DTOs.Students;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Services;

public class StudentService : IStudentService
{
    private readonly IStudentRepository _repo;
    private readonly ILogger<StudentService> _logger;

    public StudentService(IStudentRepository repo, ILogger<StudentService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<PagedResult<StudentListDto>> GetAllAsync(int? classId, string? search, int page, int pageSize)
    {
        var all = await _repo.GetAllAsync();
        var filtered = all.Where(s =>
            (classId == null || s.ClassId == classId) &&
            (string.IsNullOrWhiteSpace(search) ||
             $"{s.FirstName} {s.LastName}".Contains(search, StringComparison.OrdinalIgnoreCase) ||
             s.Roll.ToString().Contains(search)));

        var total = filtered.Count();
        var paged = filtered.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(s => new StudentListDto(
                s.Id,
                s.Roll,
                s.PhotoUrl ?? string.Empty,
                $"{s.FirstName} {s.LastName}",
                s.Gender.ToString(),
                s.Class?.Name ?? string.Empty,
                s.Section?.Name ?? string.Empty,
                s.Parent?.Name ?? string.Empty,
                s.Address ?? string.Empty,
                s.DateOfBirth,
                s.Phone,
                s.Email,
                s.ClassId,
                s.SectionId
            ));

        return new PagedResult<StudentListDto>(paged, total, page, pageSize);
    }

    public async Task<StudentDetailDto?> GetByIdAsync(int id)
    {
        var s = await _repo.GetByIdAsync(id);
        if (s == null) return null;
        return MapToDetail(s);
    }

    public async Task<StudentDetailDto> CreateAsync(CreateStudentDto dto)
    {
        var entity = new Student
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Gender = dto.Gender,
            DateOfBirth = dto.DateOfBirth,
            Roll = dto.Roll,
            BloodGroup = dto.BloodGroup,
            Religion = dto.Religion,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            PhotoUrl = dto.PhotoUrl,
            AdmissionId = dto.AdmissionId,
            ShortBio = dto.ShortBio,
            AdmissionDate = dto.AdmissionDate,
            ClassId = dto.ClassId,
            SectionId = dto.SectionId,
            ParentId = dto.ParentId,
        };
        await _repo.AddAsync(entity);
        _logger.LogInformation("Created student {Name} (Id={Id})", $"{entity.FirstName} {entity.LastName}", entity.Id);
        var created = await _repo.GetByIdAsync(entity.Id);
        return MapToDetail(created!);
    }

    public async Task<StudentDetailDto?> UpdateAsync(int id, UpdateStudentDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;

        entity.FirstName = dto.FirstName;
        entity.LastName = dto.LastName;
        entity.Gender = dto.Gender;
        entity.DateOfBirth = dto.DateOfBirth;
        entity.Roll = dto.Roll;
        entity.BloodGroup = dto.BloodGroup;
        entity.Religion = dto.Religion;
        entity.Email = dto.Email;
        entity.Phone = dto.Phone;
        entity.Address = dto.Address;
        entity.PhotoUrl = dto.PhotoUrl;
        entity.AdmissionId = dto.AdmissionId;
        entity.ShortBio = dto.ShortBio;
        entity.ClassId = dto.ClassId;
        entity.SectionId = dto.SectionId;
        entity.ParentId = dto.ParentId;

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

    public async Task<bool> PromoteAsync(PromoteStudentDto dto)
    {
        var students = await _repo.GetAllAsync();
        var toPromote = students.Where(s => s.ClassId == dto.FromClassId && s.SectionId == dto.FromSectionId).ToList();
        if (!toPromote.Any()) return false;

        foreach (var s in toPromote)
        {
            s.ClassId = dto.ToClassId;
            s.SectionId = dto.ToSectionId;
            await _repo.UpdateAsync(s);
        }
        _logger.LogInformation("Promoted {Count} students from Class {From} to Class {To}", toPromote.Count, dto.FromClassId, dto.ToClassId);
        return true;
    }

    private static StudentDetailDto MapToDetail(Student s) => new(
        s.Id,
        s.FirstName,
        s.LastName,
        s.Gender.ToString(),
        s.DateOfBirth.ToString("yyyy-MM-dd"),
        s.Roll,
        s.BloodGroup.ToString(),
        s.Religion,
        s.Email,
        s.Phone,
        s.Address,
        s.PhotoUrl,
        s.AdmissionId,
        s.ShortBio,
        s.AdmissionDate.ToString("yyyy-MM-dd"),
        s.ClassId,
        s.Class?.Name ?? string.Empty,
        s.SectionId,
        s.Section?.Name ?? string.Empty,
        s.ParentId,
        s.Parent?.Name,
        null, // FatherName - not stored separately; extend if needed
        null  // MotherName
    );
}
