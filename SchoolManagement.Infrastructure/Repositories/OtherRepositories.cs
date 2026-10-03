using Microsoft.EntityFrameworkCore;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Data;
using SchoolManagement.Infrastructure.StoredProcedures;

namespace SchoolManagement.Infrastructure.Repositories;

public class FeeRepository : IFeeRepository
{
    private readonly AppDbContext _db;
    public FeeRepository(AppDbContext db) => _db = db;

    public async Task<Fee?> GetByIdAsync(int id)
        => await _db.Fees.Include(f => f.Student).FirstOrDefaultAsync(f => f.Id == id);

    public async Task<IEnumerable<Fee>> GetAllAsync()
        => await _db.Fees.Include(f => f.Student).ThenInclude(s => s.Class).ToListAsync();

    public async Task<IEnumerable<Fee>> GetByStudentIdAsync(int studentId)
        => await _db.Fees.Where(f => f.StudentId == studentId).ToListAsync();

    public async Task AddAsync(Fee fee)
    {
        await _db.Fees.AddAsync(fee);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Fee fee)
    {
        fee.UpdatedAt = DateTime.UtcNow;
        _db.Fees.Update(fee);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Fees.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<FeeListResult>> GetFeeListAsync(int? studentId, string? status)
        => await _db.FeeListResults
            .FromSqlInterpolated($"SELECT * FROM get_all_fees({studentId}, {status})")
            .ToListAsync();
}

public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _db;
    public ExpenseRepository(AppDbContext db) => _db = db;

    public async Task<Expense?> GetByIdAsync(int id)
        => await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id);

    public async Task<IEnumerable<Expense>> GetAllAsync()
        => await _db.Expenses.ToListAsync();

    public async Task AddAsync(Expense expense)
    {
        await _db.Expenses.AddAsync(expense);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Expense expense)
    {
        expense.UpdatedAt = DateTime.UtcNow;
        _db.Expenses.Update(expense);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Expenses.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<ExpenseListResult>> GetExpenseListAsync(string? status)
        => await _db.ExpenseListResults
            .FromSqlInterpolated($"SELECT * FROM get_all_expenses({status})")
            .ToListAsync();
}

public class TransportRepository : ITransportRepository
{
    private readonly AppDbContext _db;
    public TransportRepository(AppDbContext db) => _db = db;

    public async Task<Transport?> GetByIdAsync(int id)
        => await _db.Transports.Include(t => t.StudentTransports).FirstOrDefaultAsync(t => t.Id == id);

    public async Task<IEnumerable<Transport>> GetAllAsync()
        => await _db.Transports.Include(t => t.StudentTransports).ToListAsync();

    public async Task AddAsync(Transport transport)
    {
        await _db.Transports.AddAsync(transport);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Transport transport)
    {
        transport.UpdatedAt = DateTime.UtcNow;
        _db.Transports.Update(transport);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Transports.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}

public class NoticeRepository : INoticeRepository
{
    private readonly AppDbContext _db;
    public NoticeRepository(AppDbContext db) => _db = db;

    public async Task<Notice?> GetByIdAsync(int id)
        => await _db.Notices.Include(n => n.TargetClass).FirstOrDefaultAsync(n => n.Id == id);

    public async Task<IEnumerable<Notice>> GetAllAsync()
        => await _db.Notices.Include(n => n.TargetClass).OrderByDescending(n => n.Date).ToListAsync();

    public async Task AddAsync(Notice notice)
    {
        await _db.Notices.AddAsync(notice);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Notice notice)
    {
        notice.UpdatedAt = DateTime.UtcNow;
        _db.Notices.Update(notice);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Notices.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}

public class TeacherPaymentRepository : ITeacherPaymentRepository
{
    private readonly AppDbContext _db;
    public TeacherPaymentRepository(AppDbContext db) => _db = db;

    public async Task<TeacherPayment?> GetByIdAsync(int id)
        => await _db.TeacherPayments.Include(tp => tp.Teacher).FirstOrDefaultAsync(tp => tp.Id == id);

    public async Task<IEnumerable<TeacherPayment>> GetAllAsync()
        => await _db.TeacherPayments.Include(tp => tp.Teacher).ToListAsync();

    public async Task<IEnumerable<TeacherPayment>> GetByTeacherIdAsync(int teacherId)
        => await _db.TeacherPayments.Where(tp => tp.TeacherId == teacherId).ToListAsync();

    public async Task AddAsync(TeacherPayment payment)
    {
        await _db.TeacherPayments.AddAsync(payment);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(TeacherPayment payment)
    {
        payment.UpdatedAt = DateTime.UtcNow;
        _db.TeacherPayments.Update(payment);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.TeacherPayments.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}

public class ClassRoutineRepository : IClassRoutineRepository
{
    private readonly AppDbContext _db;
    public ClassRoutineRepository(AppDbContext db) => _db = db;

    public async Task<ClassRoutine?> GetByIdAsync(int id)
        => await _db.ClassRoutines
            .AsNoTracking()
            .Include(r => r.Subject)
            .Include(r => r.Class)
            .Include(r => r.Section)
            .Include(r => r.Teacher)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<ClassRoutine?> GetByIdForUpdateAsync(int id)
        => await _db.ClassRoutines.FirstOrDefaultAsync(r => r.Id == id);

    public async Task<IEnumerable<ClassRoutine>> GetAllAsync()
        => await _db.ClassRoutines
            .AsNoTracking()
            .Include(r => r.Subject)
            .Include(r => r.Class)
            .Include(r => r.Section)
            .Include(r => r.Teacher)
            .ToListAsync();

    public async Task AddAsync(ClassRoutine routine)
    {
        await _db.ClassRoutines.AddAsync(routine);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(ClassRoutine routine)
    {
        routine.UpdatedAt = DateTime.UtcNow;
        if (_db.Entry(routine).State == EntityState.Detached)
        {
            _db.ClassRoutines.Update(routine);
        }
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.ClassRoutines.FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}
