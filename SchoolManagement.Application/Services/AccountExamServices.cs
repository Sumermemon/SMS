using SchoolManagement.Application.DTOs.Common;
using SchoolManagement.Application.DTOs.Exams;
using SchoolManagement.Application.DTOs.Accounts;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Application.Services;

public class ExamService : IExamService
{
    private readonly IExamRepository _repo;
    public ExamService(IExamRepository repo) => _repo = repo;

    public async Task<PagedResult<ExamListDto>> GetAllAsync(int? classId, int page, int pageSize)
    {
        var all = await _repo.GetAllAsync();
        var filtered = all.Where(e => classId == null || e.ClassId == classId);
        var total = filtered.Count();
        var paged = filtered.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToListDto);
        return new PagedResult<ExamListDto>(paged, total, page, pageSize);
    }

    public async Task<ExamDetailDto?> GetByIdAsync(int id)
    {
        var e = await _repo.GetByIdAsync(id);
        return e == null ? null : MapToDetailDto(e);
    }

    public async Task<ExamDetailDto> CreateAsync(CreateExamDto dto)
    {
        var entity = new Exam { Name = dto.Name, SubjectId = dto.SubjectId, ClassId = dto.ClassId, SectionId = dto.SectionId, ExamTime = dto.ExamTime, ExamDate = dto.ExamDate, TotalMarks = dto.TotalMarks };
        await _repo.AddAsync(entity);
        var created = await _repo.GetByIdAsync(entity.Id);
        return MapToDetailDto(created!);
    }

    public async Task<ExamDetailDto?> UpdateAsync(int id, UpdateExamDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Name = dto.Name; entity.SubjectId = dto.SubjectId; entity.ClassId = dto.ClassId;
        entity.SectionId = dto.SectionId; entity.ExamTime = dto.ExamTime; entity.ExamDate = dto.ExamDate;
        entity.TotalMarks = dto.TotalMarks; entity.IsPublished = dto.IsPublished;
        await _repo.UpdateAsync(entity);
        var updated = await _repo.GetByIdAsync(id);
        return MapToDetailDto(updated!);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e == null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }

    private static ExamListDto MapToListDto(Exam e) => new(e.Id, e.Name, e.Subject?.Name ?? string.Empty, e.Class?.Name ?? string.Empty, e.Section?.Name ?? string.Empty, e.ExamTime.ToString("HH:mm"), e.ExamDate.ToString("yyyy-MM-dd"), e.IsPublished);
    private static ExamDetailDto MapToDetailDto(Exam e) => new(e.Id, e.Name, e.SubjectId, e.Subject?.Name ?? string.Empty, e.ClassId, e.Class?.Name ?? string.Empty, e.SectionId, e.Section?.Name ?? string.Empty, e.ExamTime, e.ExamDate, e.TotalMarks, e.IsPublished);
}

public class ExamGradeService : IExamGradeService
{
    private readonly IExamGradeRepository _repo;
    public ExamGradeService(IExamGradeRepository repo) => _repo = repo;

    public async Task<IEnumerable<ExamGradeDto>> GetByExamIdAsync(int examId)
    {
        var all = await _repo.GetByExamIdAsync(examId);
        return all.Select(MapToDto);
    }

    public async Task<IEnumerable<ExamGradeDto>> GetByStudentIdAsync(int studentId)
    {
        var all = await _repo.GetByStudentIdAsync(studentId);
        return all.Select(MapToDto);
    }

    public async Task BulkCreateAsync(BulkCreateExamGradeDto dto)
    {
        var entities = dto.Grades.Select(g => new ExamGrade
        {
            ExamId = dto.ExamId,
            StudentId = g.StudentId,
            MarksObtained = g.MarksObtained,
            Grade = g.Grade,
            Remarks = g.Remarks
        });
        await _repo.AddRangeAsync(entities);
    }

    public async Task<ExamGradeDto?> UpdateAsync(int id, CreateExamGradeDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.MarksObtained = dto.MarksObtained; entity.Grade = dto.Grade; entity.Remarks = dto.Remarks;
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

    private static ExamGradeDto MapToDto(ExamGrade g) => new(g.Id, g.ExamId,
        g.Exam?.Name ?? string.Empty, g.StudentId,
        g.Student != null ? $"{g.Student.FirstName} {g.Student.LastName}" : string.Empty,
        g.MarksObtained, g.Grade, g.Remarks);
}

public class FeeService : IFeeService
{
    private readonly IFeeRepository _repo;
    public FeeService(IFeeRepository repo) => _repo = repo;

    public async Task<PagedResult<FeeListDto>> GetAllAsync(int? studentId, string? status, int page, int pageSize)
    {
        var all = studentId.HasValue ? await _repo.GetByStudentIdAsync(studentId.Value) : await _repo.GetAllAsync();
        var filtered = all.Where(f => string.IsNullOrWhiteSpace(status) || f.Status.ToString().Equals(status, StringComparison.OrdinalIgnoreCase));
        var total = filtered.Count();
        var paged = filtered.Skip((page - 1) * pageSize).Take(pageSize).Select(f => new FeeListDto(
            f.Id, f.StudentId,
            f.Student != null ? $"{f.Student.FirstName} {f.Student.LastName}" : string.Empty,
            f.Student?.Class?.Name ?? string.Empty,
            f.FeeType, f.Amount,
            f.DueDate.ToString("yyyy-MM-dd"),
            f.PaidDate?.ToString("yyyy-MM-dd"),
            f.Status.ToString()));
        return new PagedResult<FeeListDto>(paged, total, page, pageSize);
    }

    public async Task<FeeListDto?> GetByIdAsync(int id)
    {
        var f = await _repo.GetByIdAsync(id);
        return f == null ? null : new FeeListDto(f.Id, f.StudentId,
            f.Student != null ? $"{f.Student.FirstName} {f.Student.LastName}" : string.Empty,
            f.Student?.Class?.Name ?? string.Empty,
            f.FeeType, f.Amount, f.DueDate.ToString("yyyy-MM-dd"), f.PaidDate?.ToString("yyyy-MM-dd"), f.Status.ToString());
    }

    public async Task<FeeListDto> CreateAsync(CreateFeeDto dto)
    {
        var entity = new Fee { StudentId = dto.StudentId, FeeType = dto.FeeType, Amount = dto.Amount, DueDate = dto.DueDate, Remarks = dto.Remarks };
        await _repo.AddAsync(entity);
        return new FeeListDto(entity.Id, entity.StudentId, string.Empty, string.Empty, entity.FeeType, entity.Amount, entity.DueDate.ToString("yyyy-MM-dd"), null, entity.Status.ToString());
    }

    public async Task<FeeListDto?> UpdateAsync(int id, UpdateFeeDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.FeeType = dto.FeeType; entity.Amount = dto.Amount; entity.DueDate = dto.DueDate;
        entity.PaidDate = dto.PaidDate; entity.Status = dto.Status; entity.Remarks = dto.Remarks;
        await _repo.UpdateAsync(entity);
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id) { var f = await _repo.GetByIdAsync(id); if (f == null) return false; await _repo.DeleteAsync(id); return true; }
}

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _repo;
    public ExpenseService(IExpenseRepository repo) => _repo = repo;

    public async Task<PagedResult<ExpenseListDto>> GetAllAsync(string? status, int page, int pageSize)
    {
        var all = await _repo.GetAllAsync();
        var filtered = all.Where(e => string.IsNullOrWhiteSpace(status) || e.Status.ToString().Equals(status, StringComparison.OrdinalIgnoreCase));
        var total = filtered.Count();
        var paged = filtered.Skip((page - 1) * pageSize).Take(pageSize).Select(e => new ExpenseListDto(
            e.Id, e.PhotoUrl ?? string.Empty, e.Name, e.ExpenseType, e.Amount, e.Status.ToString(), e.Phone, e.Email, e.Date.ToString("yyyy-MM-dd")));
        return new PagedResult<ExpenseListDto>(paged, total, page, pageSize);
    }

    public async Task<ExpenseListDto?> GetByIdAsync(int id)
    {
        var e = await _repo.GetByIdAsync(id);
        return e == null ? null : new ExpenseListDto(e.Id, e.PhotoUrl ?? string.Empty, e.Name, e.ExpenseType, e.Amount, e.Status.ToString(), e.Phone, e.Email, e.Date.ToString("yyyy-MM-dd"));
    }

    public async Task<ExpenseListDto> CreateAsync(CreateExpenseDto dto)
    {
        var status = ExpenseStatus.Pending;
        if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<ExpenseStatus>(dto.Status, true, out var parsed))
            status = parsed;

        var entity = new Expense
        {
            Name = dto.Name,
            ExpenseType = dto.ExpenseType,
            Amount = dto.Amount,
            Phone = dto.Phone,
            Email = dto.Email,
            Date = dto.Date,
            PhotoUrl = dto.PhotoUrl,
            Remarks = dto.Remarks,
            Status = status
        };
        await _repo.AddAsync(entity);
        return new ExpenseListDto(entity.Id, entity.PhotoUrl ?? string.Empty, entity.Name, entity.ExpenseType, entity.Amount, entity.Status.ToString(), entity.Phone, entity.Email, entity.Date.ToString("yyyy-MM-dd"));
    }

    public async Task<ExpenseListDto?> UpdateAsync(int id, UpdateExpenseDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Name = dto.Name;
        entity.ExpenseType = dto.ExpenseType;
        entity.Amount = dto.Amount;
        if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<ExpenseStatus>(dto.Status, true, out var parsedStatus))
        {
            entity.Status = parsedStatus;
        }
        entity.Phone = dto.Phone;
        entity.Email = dto.Email;
        entity.Date = dto.Date;
        entity.PhotoUrl = dto.PhotoUrl;
        entity.Remarks = dto.Remarks;
        await _repo.UpdateAsync(entity);
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id) { var e = await _repo.GetByIdAsync(id); if (e == null) return false; await _repo.DeleteAsync(id); return true; }
}
