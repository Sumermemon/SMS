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
        var subjectIds = dto.AssignedSubjectIds ?? (dto.SubjectId.HasValue ? new List<int> { dto.SubjectId.Value } : new List<int>());
        var classIds = dto.AssignedClassIds ?? (dto.ClassId.HasValue ? new List<int> { dto.ClassId.Value } : new List<int>());

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
            SubjectId = dto.SubjectId ?? subjectIds.FirstOrDefault(),
            ClassId = dto.ClassId ?? classIds.FirstOrDefault(),
            SectionId = dto.SectionId,
            AssignedSubjectIds = subjectIds.Any() ? string.Join(",", subjectIds.Distinct()) : null,
            AssignedClassIds = classIds.Any() ? string.Join(",", classIds.Distinct()) : null,
        };
        await _repo.AddAsync(entity);
        var created = await _repo.GetByIdAsync(entity.Id);
        return MapToDetail(created!);
    }

    public async Task<TeacherDetailDto?> UpdateAsync(int id, UpdateTeacherDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;

        var subjectIds = dto.AssignedSubjectIds ?? (dto.SubjectId.HasValue ? new List<int> { dto.SubjectId.Value } : new List<int>());
        var classIds = dto.AssignedClassIds ?? (dto.ClassId.HasValue ? new List<int> { dto.ClassId.Value } : new List<int>());

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
        entity.SubjectId = dto.SubjectId ?? subjectIds.FirstOrDefault();
        entity.ClassId = dto.ClassId ?? classIds.FirstOrDefault();
        entity.SectionId = dto.SectionId;
        entity.AssignedSubjectIds = subjectIds.Any() ? string.Join(",", subjectIds.Distinct()) : null;
        entity.AssignedClassIds = classIds.Any() ? string.Join(",", classIds.Distinct()) : null;

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

    private static (List<string> subjects, List<string> classes, List<int> subjectIds, List<int> classIds) ExtractAssigned(Teacher t)
    {
        var subjects = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var classes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var subjectIds = new HashSet<int>();
        var classIds = new HashSet<int>();

        if (t.Subject != null && !string.IsNullOrWhiteSpace(t.Subject.Name))
            subjects.Add(t.Subject.Name);
        if (t.SubjectId.HasValue)
            subjectIds.Add(t.SubjectId.Value);

        if (t.Class != null && !string.IsNullOrWhiteSpace(t.Class.Name))
            classes.Add(t.Class.Name);
        if (t.ClassId.HasValue)
            classIds.Add(t.ClassId.Value);

        if (!string.IsNullOrWhiteSpace(t.AssignedSubjectIds))
        {
            foreach (var part in t.AssignedSubjectIds.Split(',', StringSplitOptions.RemoveEmptyEntries))
            {
                if (int.TryParse(part.Trim(), out var sid)) subjectIds.Add(sid);
            }
        }

        if (!string.IsNullOrWhiteSpace(t.AssignedClassIds))
        {
            foreach (var part in t.AssignedClassIds.Split(',', StringSplitOptions.RemoveEmptyEntries))
            {
                if (int.TryParse(part.Trim(), out var cid)) classIds.Add(cid);
            }
        }

        // Aggregate from all timetable routines
        if (t.ClassRoutines != null)
        {
            foreach (var r in t.ClassRoutines)
            {
                if (r.Subject != null && !string.IsNullOrWhiteSpace(r.Subject.Name))
                {
                    subjects.Add(r.Subject.Name);
                    subjectIds.Add(r.SubjectId);
                }
                if (r.Class != null && !string.IsNullOrWhiteSpace(r.Class.Name))
                {
                    classes.Add(r.Class.Name);
                    classIds.Add(r.ClassId);
                }
            }
        }

        return (subjects.ToList(), classes.ToList(), subjectIds.ToList(), classIds.ToList());
    }

    private static TeacherListDto MapToListDto(Teacher t)
    {
        var (subjects, classes, subjectIds, classIds) = ExtractAssigned(t);
        var primarySubject = subjects.FirstOrDefault() ?? t.Subject?.Name;
        var primaryClass = classes.FirstOrDefault() ?? t.Class?.Name;

        return new TeacherListDto(
            t.Id,
            t.PhotoUrl ?? string.Empty,
            $"{t.FirstName} {t.LastName}",
            t.Gender.ToString(),
            primaryClass,
            primarySubject,
            t.Section?.Name,
            t.Address,
            t.Phone,
            t.Email,
            t.JoiningDate.ToString("yyyy-MM-dd"),
            subjects,
            classes,
            subjectIds,
            classIds
        );
    }

    private static TeacherDetailDto MapToDetail(Teacher t)
    {
        var (subjects, classes, subjectIds, classIds) = ExtractAssigned(t);
        var primarySubject = subjects.FirstOrDefault() ?? t.Subject?.Name;
        var primaryClass = classes.FirstOrDefault() ?? t.Class?.Name;

        return new TeacherDetailDto(
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
            t.SubjectId ?? subjectIds.FirstOrDefault(),
            primarySubject,
            t.ClassId ?? classIds.FirstOrDefault(),
            primaryClass,
            t.SectionId,
            t.Section?.Name,
            subjects,
            classes,
            subjectIds,
            classIds
        );
    }
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
        var paidDate = dto.PaidDate ?? dto.PaymentDate ?? (dto.Month.HasValue && dto.Year.HasValue ? new DateOnly(dto.Year.Value, dto.Month.Value, 1) : DateOnly.FromDateTime(DateTime.Today));
        var status = PaymentStatus.Pending;
        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            if (dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("Paid", StringComparison.OrdinalIgnoreCase))
                status = PaymentStatus.Paid;
            else if (Enum.TryParse<PaymentStatus>(dto.Status, true, out var parsed))
                status = parsed;
        }

        var entity = new TeacherPayment
        {
            TeacherId = dto.TeacherId,
            Amount = dto.Amount,
            Month = dto.Month ?? paidDate.Month,
            Year = dto.Year ?? paidDate.Year,
            Notes = dto.Notes ?? dto.Remarks,
            PaidDate = paidDate,
            Status = status
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

        var paidDate = dto.PaidDate ?? dto.PaymentDate;
        if (paidDate.HasValue)
        {
            entity.PaidDate = paidDate.Value;
            entity.Month = dto.Month ?? paidDate.Value.Month;
            entity.Year = dto.Year ?? paidDate.Value.Year;
        }
        else
        {
            if (dto.Month.HasValue) entity.Month = dto.Month.Value;
            if (dto.Year.HasValue) entity.Year = dto.Year.Value;
        }

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            if (dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("Paid", StringComparison.OrdinalIgnoreCase))
                entity.Status = PaymentStatus.Paid;
            else if (Enum.TryParse<PaymentStatus>(dto.Status, true, out var parsed))
                entity.Status = parsed;
        }

        entity.Notes = dto.Notes ?? dto.Remarks;
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
        tp.Status == PaymentStatus.Paid ? "Completed" : tp.Status.ToString(),
        tp.PaidDate?.ToString("yyyy-MM-dd"),
        tp.Notes,
        tp.PaidDate?.ToString("yyyy-MM-dd")
    );
}
