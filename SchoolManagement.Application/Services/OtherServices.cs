using SchoolManagement.Application.DTOs.Common;
using SchoolManagement.Application.DTOs.Parents;
using SchoolManagement.Application.DTOs.Classes;
using SchoolManagement.Application.DTOs.Routines;
using SchoolManagement.Application.DTOs.Attendance;
using SchoolManagement.Application.DTOs.Notices;
using SchoolManagement.Application.DTOs.Transport;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Services;

public class ParentService : IParentService
{
    private readonly IParentRepository _repo;
    public ParentService(IParentRepository repo) => _repo = repo;

    public async Task<PagedResult<ParentDto>> GetAllAsync(int page, int pageSize)
    {
        var all = await _repo.GetAllAsync();
        var total = all.Count();
        var paged = all.Skip((page - 1) * pageSize).Take(pageSize).Select(p => new ParentDto(
            p.Id, p.Name, p.Email, p.Phone, p.Address, p.Occupation, p.PhotoUrl,
            p.Students.Select(s => $"{s.FirstName} {s.LastName}")));
        return new PagedResult<ParentDto>(paged, total, page, pageSize);
    }

    public async Task<ParentDto?> GetByIdAsync(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return null;
        return new ParentDto(p.Id, p.Name, p.Email, p.Phone, p.Address, p.Occupation, p.PhotoUrl,
            p.Students.Select(s => $"{s.FirstName} {s.LastName}"));
    }

    public async Task<ParentDto> CreateAsync(CreateParentDto dto)
    {
        var entity = new Parent { Name = dto.Name, Email = dto.Email, Phone = dto.Phone, Address = dto.Address, Occupation = dto.Occupation, PhotoUrl = dto.PhotoUrl };
        await _repo.AddAsync(entity);
        return new ParentDto(entity.Id, entity.Name, entity.Email, entity.Phone, entity.Address, entity.Occupation, entity.PhotoUrl, []);
    }

    public async Task<ParentDto?> UpdateAsync(int id, UpdateParentDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Name = dto.Name; entity.Email = dto.Email; entity.Phone = dto.Phone;
        entity.Address = dto.Address; entity.Occupation = dto.Occupation; entity.PhotoUrl = dto.PhotoUrl;
        await _repo.UpdateAsync(entity);
        return new ParentDto(entity.Id, entity.Name, entity.Email, entity.Phone, entity.Address, entity.Occupation, entity.PhotoUrl,
            entity.Students.Select(s => $"{s.FirstName} {s.LastName}"));
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repo.ExistsAsync(id)) return false;
        await _repo.DeleteAsync(id); return true;
    }
}

public class ClassService : IClassService
{
    private readonly IClassRepository _repo;
    public ClassService(IClassRepository repo) => _repo = repo;

    public async Task<IEnumerable<ClassDto>> GetAllAsync()
    {
        var all = await _repo.GetAllAsync();
        return all.Select(c => new ClassDto(c.Id, c.Name, c.Note, c.Sections.Count, c.Students.Count));
    }

    public async Task<ClassDto?> GetByIdAsync(int id)
    {
        var c = await _repo.GetByIdAsync(id);
        return c == null ? null : new ClassDto(c.Id, c.Name, c.Note, c.Sections.Count, c.Students.Count);
    }

    public async Task<ClassDto> CreateAsync(CreateClassDto dto)
    {
        var entity = new Class { Name = dto.Name, Note = dto.Note };
        await _repo.AddAsync(entity);
        return new ClassDto(entity.Id, entity.Name, entity.Note, 0, 0);
    }

    public async Task<ClassDto?> UpdateAsync(int id, UpdateClassDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Name = dto.Name;
        entity.Note = dto.Note;
        await _repo.UpdateAsync(entity);
        return new ClassDto(entity.Id, entity.Name, entity.Note, entity.Sections.Count, entity.Students.Count);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;
        await _repo.DeleteAsync(id); return true;
    }
}

public class SectionService : ISectionService
{
    private readonly ISectionRepository _repo;
    public SectionService(ISectionRepository repo) => _repo = repo;

    public async Task<IEnumerable<SectionDto>> GetAllAsync(int? classId)
    {
        var all = classId.HasValue ? await _repo.GetByClassIdAsync(classId.Value) : await _repo.GetAllAsync();
        return all.Select(s => new SectionDto(s.Id, s.Name, s.ClassId, s.Class?.Name ?? string.Empty));
    }

    public async Task<SectionDto?> GetByIdAsync(int id)
    {
        var s = await _repo.GetByIdAsync(id);
        return s == null ? null : new SectionDto(s.Id, s.Name, s.ClassId, s.Class?.Name ?? string.Empty);
    }

    public async Task<SectionDto> CreateAsync(CreateSectionDto dto)
    {
        var entity = new Section { Name = dto.Name, ClassId = dto.ClassId };
        await _repo.AddAsync(entity);
        var created = await _repo.GetByIdAsync(entity.Id);
        return new SectionDto(created!.Id, created.Name, created.ClassId, created.Class?.Name ?? string.Empty);
    }

    public async Task<SectionDto?> UpdateAsync(int id, UpdateSectionDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Name = dto.Name; entity.ClassId = dto.ClassId;
        await _repo.UpdateAsync(entity);
        var updated = await _repo.GetByIdAsync(id);
        return new SectionDto(updated!.Id, updated.Name, updated.ClassId, updated.Class?.Name ?? string.Empty);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;
        await _repo.DeleteAsync(id); return true;
    }
}

public class SubjectService : ISubjectService
{
    private readonly ISubjectRepository _repo;
    public SubjectService(ISubjectRepository repo) => _repo = repo;

    public async Task<IEnumerable<SubjectDto>> GetAllAsync(int? classId)
    {
        var all = classId.HasValue ? await _repo.GetByClassIdAsync(classId.Value) : await _repo.GetAllAsync();
        return all.Select(s => new SubjectDto(s.Id, s.Name, s.SubjectType, s.SubjectCode, s.ClassId, s.Class?.Name ?? string.Empty));
    }

    public async Task<SubjectDto?> GetByIdAsync(int id)
    {
        var s = await _repo.GetByIdAsync(id);
        return s == null ? null : new SubjectDto(s.Id, s.Name, s.SubjectType, s.SubjectCode, s.ClassId, s.Class?.Name ?? string.Empty);
    }

    public async Task<SubjectDto> CreateAsync(CreateSubjectDto dto)
    {
        var entity = new Subject { Name = dto.Name, SubjectType = dto.SubjectType, SubjectCode = dto.SubjectCode, ClassId = dto.ClassId };
        await _repo.AddAsync(entity);
        var created = await _repo.GetByIdAsync(entity.Id);
        return new SubjectDto(created!.Id, created.Name, created.SubjectType, created.SubjectCode, created.ClassId, created.Class?.Name ?? string.Empty);
    }

    public async Task<SubjectDto?> UpdateAsync(int id, UpdateSubjectDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Name = dto.Name; entity.SubjectType = dto.SubjectType; entity.SubjectCode = dto.SubjectCode; entity.ClassId = dto.ClassId;
        await _repo.UpdateAsync(entity);
        var updated = await _repo.GetByIdAsync(id);
        return new SubjectDto(updated!.Id, updated.Name, updated.SubjectType, updated.SubjectCode, updated.ClassId, updated.Class?.Name ?? string.Empty);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;
        await _repo.DeleteAsync(id); return true;
    }
}

public class ClassRoutineService : IClassRoutineService
{
    private readonly IClassRoutineRepository _repo;
    public ClassRoutineService(IClassRoutineRepository repo) => _repo = repo;

    public async Task<PagedResult<ClassRoutineListDto>> GetAllAsync(int? classId, string? day, int page, int pageSize)
    {
        var all = await _repo.GetAllAsync();
        var filtered = all.Where(r =>
            (classId == null || r.ClassId == classId) &&
            (string.IsNullOrWhiteSpace(day) || r.Day.Equals(day, StringComparison.OrdinalIgnoreCase)));
        var total = filtered.Count();
        var paged = filtered.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToDto);
        return new PagedResult<ClassRoutineListDto>(paged, total, page, pageSize);
    }

    public async Task<ClassRoutineListDto?> GetByIdAsync(int id)
    {
        var r = await _repo.GetByIdAsync(id);
        return r == null ? null : MapToDto(r);
    }

    public async Task<ClassRoutineListDto> CreateAsync(CreateClassRoutineDto dto)
    {
        var entity = new ClassRoutine { SubjectId = dto.SubjectId, ClassId = dto.ClassId, SectionId = dto.SectionId, TeacherId = dto.TeacherId, Day = dto.Day, TimeSlot = dto.TimeSlot, EffectiveDate = dto.EffectiveDate };
        await _repo.AddAsync(entity);
        var created = await _repo.GetByIdAsync(entity.Id);
        return MapToDto(created!);
    }

    public async Task<ClassRoutineListDto?> UpdateAsync(int id, UpdateClassRoutineDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.SubjectId = dto.SubjectId; entity.ClassId = dto.ClassId; entity.SectionId = dto.SectionId;
        entity.TeacherId = dto.TeacherId; entity.Day = dto.Day; entity.TimeSlot = dto.TimeSlot; entity.EffectiveDate = dto.EffectiveDate;
        await _repo.UpdateAsync(entity);
        var updated = await _repo.GetByIdAsync(id);
        return MapToDto(updated!);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;
        await _repo.DeleteAsync(id); return true;
    }

    private static ClassRoutineListDto MapToDto(ClassRoutine r) => new(
        r.Id, r.Day, r.Class?.Name ?? string.Empty, r.Subject?.Name ?? string.Empty,
        r.Section?.Name ?? string.Empty,
        r.Teacher != null ? $"{r.Teacher.FirstName} {r.Teacher.LastName}" : null,
        r.TimeSlot, r.EffectiveDate?.ToString("yyyy-MM-dd"));
}

public class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _repo;
    public AttendanceService(IAttendanceRepository repo) => _repo = repo;

    public async Task<IEnumerable<AttendanceSheetDto>> GetAttendanceSheetAsync(int classId, int sectionId, int month, int year)
    {
        var records = await _repo.GetAllAsync();
        var filtered = records.Where(a => a.ClassId == classId && a.SectionId == sectionId &&
                                         a.Date.Month == month && a.Date.Year == year)
            .GroupBy(a => a.StudentId);

        return filtered.Select(g =>
        {
            var first = g.First();
            var dayStatus = g.ToDictionary(a => a.Date.Day, a => (bool?)a.IsPresent);
            return new AttendanceSheetDto(g.Key, $"{first.Student?.FirstName} {first.Student?.LastName}", first.Student?.Roll.ToString() ?? string.Empty, dayStatus);
        });
    }

    public async Task MarkAttendanceAsync(MarkAttendanceDto dto)
    {
        var entities = dto.Entries.Select(e => new Attendance
        {
            StudentId = e.StudentId,
            ClassId = dto.ClassId,
            SectionId = dto.SectionId,
            Date = dto.Date,
            IsPresent = e.IsPresent,
            Remarks = e.Remarks
        });
        await _repo.AddRangeAsync(entities);
    }

    public async Task<IEnumerable<AttendanceDto>> GetByStudentAsync(int studentId)
    {
        var all = await _repo.GetByStudentAsync(studentId);
        return all.Select(a => new AttendanceDto(a.Id, a.StudentId,
            a.Student != null ? $"{a.Student.FirstName} {a.Student.LastName}" : string.Empty,
            a.ClassId, a.Class?.Name ?? string.Empty, a.SectionId, a.Section?.Name ?? string.Empty,
            a.Date, a.IsPresent, a.Remarks));
    }
}

public class NoticeService : INoticeService
{
    private readonly INoticeRepository _repo;
    public NoticeService(INoticeRepository repo) => _repo = repo;

    public async Task<PagedResult<NoticeDto>> GetAllAsync(string? search, int page, int pageSize)
    {
        var all = await _repo.GetAllAsync();
        var filtered = all.Where(n => string.IsNullOrWhiteSpace(search) ||
            n.Title.Contains(search, StringComparison.OrdinalIgnoreCase));
        var total = filtered.Count();
        var paged = filtered.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToDto);
        return new PagedResult<NoticeDto>(paged, total, page, pageSize);
    }

    public async Task<NoticeDto?> GetByIdAsync(int id) { var n = await _repo.GetByIdAsync(id); return n == null ? null : MapToDto(n); }

    public async Task<NoticeDto> CreateAsync(CreateNoticeDto dto)
    {
        var entity = new Notice { Title = dto.Title, Details = dto.Details, PostedBy = dto.PostedBy, Date = dto.Date };
        await _repo.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task<NoticeDto?> UpdateAsync(int id, UpdateNoticeDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Title = dto.Title; entity.Details = dto.Details; entity.PostedBy = dto.PostedBy; entity.Date = dto.Date;
        await _repo.UpdateAsync(entity);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id) { var n = await _repo.GetByIdAsync(id); if (n == null) return false; await _repo.DeleteAsync(id); return true; }

    private static NoticeDto MapToDto(Notice n) => new(n.Id, n.Title, n.Details, n.PostedBy, n.Date.ToString("yyyy-MM-dd"), n.ViewCount, n.CreatedAt.ToString("yyyy-MM-dd HH:mm"));
}

public class TransportService : ITransportService
{
    private readonly ITransportRepository _repo;
    public TransportService(ITransportRepository repo) => _repo = repo;

    public async Task<PagedResult<TransportDto>> GetAllAsync(int page, int pageSize)
    {
        var all = await _repo.GetAllAsync();
        var total = all.Count();
        var paged = all.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToDto);
        return new PagedResult<TransportDto>(paged, total, page, pageSize);
    }

    public async Task<TransportDto?> GetByIdAsync(int id) { var t = await _repo.GetByIdAsync(id); return t == null ? null : MapToDto(t); }

    public async Task<TransportDto> CreateAsync(CreateTransportDto dto)
    {
        var entity = new Transport { RouteTitle = dto.RouteTitle, VehicleNo = dto.VehicleNo, DriverName = dto.DriverName, DriverPhone = dto.DriverPhone, HelperName = dto.HelperName, HelperPhone = dto.HelperPhone, DriverLicense = dto.DriverLicense };
        await _repo.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task<TransportDto?> UpdateAsync(int id, UpdateTransportDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.RouteTitle = dto.RouteTitle; entity.VehicleNo = dto.VehicleNo; entity.DriverName = dto.DriverName;
        entity.DriverPhone = dto.DriverPhone; entity.HelperName = dto.HelperName; entity.HelperPhone = dto.HelperPhone; entity.DriverLicense = dto.DriverLicense;
        await _repo.UpdateAsync(entity);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id) { var t = await _repo.GetByIdAsync(id); if (t == null) return false; await _repo.DeleteAsync(id); return true; }

    private static TransportDto MapToDto(Transport t) => new(t.Id, t.RouteTitle, t.VehicleNo, t.DriverName, t.DriverPhone, t.HelperName, t.HelperPhone, t.DriverLicense, t.StudentTransports.Count);
}
