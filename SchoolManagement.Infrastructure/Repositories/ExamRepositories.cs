using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;
using SchoolManagement.Infrastructure.StoredProcedures;

namespace SchoolManagement.Infrastructure.Repositories;

public class ExamRepository : IExamRepository
{
    private readonly AppDbContext _db;
    public ExamRepository(AppDbContext db) => _db = db;

    public async Task<Exam?> GetByIdAsync(int id)
        => await _db.Exams
            .Include(e => e.Subject)
            .Include(e => e.Class)
            .Include(e => e.Section)
            .FirstOrDefaultAsync(e => e.Id == id);

    public async Task<IEnumerable<Exam>> GetAllAsync()
        => await _db.Exams
            .Include(e => e.Subject)
            .Include(e => e.Class)
            .Include(e => e.Section)
            .ToListAsync();

    public async Task AddAsync(Exam exam)
    {
        await _db.Exams.AddAsync(exam);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Exam exam)
    {
        exam.UpdatedAt = DateTime.UtcNow;
        _db.Exams.Update(exam);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Exams.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<ExamScheduleResult>> GetExamScheduleAsync(int? classId)
        => await _db.ExamScheduleResults
            .FromSqlInterpolated($"SELECT * FROM get_exam_schedule({classId})")
            .ToListAsync();
}

public class ExamGradeRepository : IExamGradeRepository
{
    private readonly AppDbContext _db;
    public ExamGradeRepository(AppDbContext db) => _db = db;

    public async Task<ExamGrade?> GetByIdAsync(int id)
        => await _db.ExamGrades.Include(g => g.Exam).Include(g => g.Student).FirstOrDefaultAsync(g => g.Id == id);

    public async Task<IEnumerable<ExamGrade>> GetByExamIdAsync(int examId)
        => await _db.ExamGrades.Where(g => g.ExamId == examId).Include(g => g.Student).ToListAsync();

    public async Task<IEnumerable<ExamGrade>> GetByStudentIdAsync(int studentId)
        => await _db.ExamGrades.Where(g => g.StudentId == studentId).Include(g => g.Exam).ThenInclude(e => e.Subject).ToListAsync();

    public async Task AddAsync(ExamGrade grade)
    {
        await _db.ExamGrades.AddAsync(grade);
        await _db.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<ExamGrade> grades)
    {
        await _db.ExamGrades.AddRangeAsync(grades);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(ExamGrade grade)
    {
        grade.UpdatedAt = DateTime.UtcNow;
        _db.ExamGrades.Update(grade);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.ExamGrades.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            await _db.SaveChangesAsync();
        }
    }
}
