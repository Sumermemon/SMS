using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Domain.Common;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Identity;
using SchoolManagement.Infrastructure.StoredProcedures;

namespace SchoolManagement.Infrastructure.Data;

/// <summary>
/// Main application DbContext with multi-tenant global query filters.
/// All tenant-scoped entities automatically filter by TenantId from the JWT claim.
/// SuperAdmin users (IsSuperAdmin=true) bypass filters.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser, AppRole, string>
{
    private readonly ITenantContext _tenantContext;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    // ── Multi-Tenant Core ─────────────────────────────────────────────────────
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<TenantPermission> TenantPermissions => Set<TenantPermission>();
    public DbSet<ExceptionLog> ExceptionLogs => Set<ExceptionLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    // ── School Data ───────────────────────────────────────────────────────────
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Parent> Parents => Set<Parent>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<ClassRoutine> ClassRoutines => Set<ClassRoutine>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamGrade> ExamGrades => Set<ExamGrade>();
    public DbSet<Fee> Fees => Set<Fee>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Transport> Transports => Set<Transport>();
    public DbSet<StudentTransport> StudentTransports => Set<StudentTransport>();
    public DbSet<Notice> Notices => Set<Notice>();
    public DbSet<TeacherPayment> TeacherPayments => Set<TeacherPayment>();

    // ── Keyless SP result sets ────────────────────────────────────────────────
    public DbSet<StudentListResult> StudentListResults => Set<StudentListResult>();
    public DbSet<TeacherListResult> TeacherListResults => Set<TeacherListResult>();
    public DbSet<RoutineListResult> RoutineListResults => Set<RoutineListResult>();
    public DbSet<ExamScheduleResult> ExamScheduleResults => Set<ExamScheduleResult>();
    public DbSet<AttendanceSheetResult> AttendanceSheetResults => Set<AttendanceSheetResult>();
    public DbSet<ExpenseListResult> ExpenseListResults => Set<ExpenseListResult>();
    public DbSet<FeeListResult> FeeListResults => Set<FeeListResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply snake_case naming convention
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName() ?? entity.ClrType.Name));
            foreach (var prop in entity.GetProperties())
                prop.SetColumnName(ToSnakeCase(prop.GetColumnName()));
            foreach (var key in entity.GetKeys())
                key.SetName(ToSnakeCase(key.GetName() ?? "pk"));
            foreach (var fk in entity.GetForeignKeys())
                fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName() ?? "fk"));
            foreach (var idx in entity.GetIndexes())
                idx.SetDatabaseName(ToSnakeCase(idx.GetDatabaseName() ?? "ix"));
        }

        // Apply all IEntityTypeConfiguration classes from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Register keyless entities
        modelBuilder.Entity<StudentListResult>().HasNoKey().ToView(null);
        modelBuilder.Entity<TeacherListResult>().HasNoKey().ToView(null);
        modelBuilder.Entity<RoutineListResult>().HasNoKey().ToView(null);
        modelBuilder.Entity<ExamScheduleResult>().HasNoKey().ToView(null);
        modelBuilder.Entity<AttendanceSheetResult>().HasNoKey().ToView(null);
        modelBuilder.Entity<ExpenseListResult>().HasNoKey().ToView(null);
        modelBuilder.Entity<FeeListResult>().HasNoKey().ToView(null);

        // ── Global Tenant Query Filters ───────────────────────────────────────
        // When IsSuperAdmin=true TenantId=0, filter is bypassed via IsSuperAdmin check.
        // Otherwise all queries are scoped to the current tenant automatically.
        ApplyTenantFilters(modelBuilder);
    }

    private void ApplyTenantFilters(ModelBuilder modelBuilder)
    {
        // Each tenant-scoped entity gets a query filter.
        // SuperAdmin (TenantId == 0) sees all; regular users see only their tenant.
        modelBuilder.Entity<Student>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Teacher>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Parent>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Class>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Section>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Subject>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<ClassRoutine>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Attendance>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Exam>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<ExamGrade>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Fee>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Expense>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Transport>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<StudentTransport>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<Notice>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
        modelBuilder.Entity<TeacherPayment>().HasQueryFilter(e =>
            !e.IsDeleted && (_tenantContext.IsSuperAdmin || e.TenantId == _tenantContext.TenantId));
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        EnforceTenantIsolationAndAuditing();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        EnforceTenantIsolationAndAuditing();
        return base.SaveChanges();
    }

    private void EnforceTenantIsolationAndAuditing()
    {
        var currentTenantId = _tenantContext.TenantId;
        var isSuperAdmin = _tenantContext.IsSuperAdmin;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedAt = DateTime.UtcNow;

                // If non-superadmin, auto-enforce current user's tenant ID
                if (!isSuperAdmin && currentTenantId > 0)
                {
                    entry.Entity.TenantId = currentTenantId;
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;

                // Guard against cross-tenant tampering
                if (!isSuperAdmin && currentTenantId > 0)
                {
                    if (entry.Entity.TenantId != currentTenantId)
                    {
                        throw new UnauthorizedAccessException(
                            $"Cross-tenant operation rejected. Context Tenant: {currentTenantId}, Entity Tenant: {entry.Entity.TenantId}");
                    }
                }
            }
            else if (entry.State == EntityState.Deleted)
            {
                if (!isSuperAdmin && currentTenantId > 0)
                {
                    if (entry.Entity.TenantId != currentTenantId)
                    {
                        throw new UnauthorizedAccessException(
                            $"Cross-tenant delete operation rejected. Context Tenant: {currentTenantId}, Entity Tenant: {entry.Entity.TenantId}");
                    }
                }
            }
        }
    }

    private static string ToSnakeCase(string name)
    {
        if (string.IsNullOrEmpty(name)) return name;
        var result = new System.Text.StringBuilder();
        for (int i = 0; i < name.Length; i++)
        {
            var c = name[i];
            if (char.IsUpper(c) && i > 0)
                result.Append('_');
            result.Append(char.ToLower(c));
        }
        return result.ToString();
    }
}
