using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Identity;
using SchoolManagement.Infrastructure.StoredProcedures;

namespace SchoolManagement.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Entity DbSets
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

    // Keyless SP result sets
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
