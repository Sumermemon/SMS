using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Infrastructure.Data.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.LastName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Email).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Phone).HasMaxLength(20);
        builder.Property(s => s.PhotoUrl).HasMaxLength(500);
        builder.Property(s => s.Address).HasMaxLength(500);
        builder.Property(s => s.AdmissionId).HasMaxLength(50);
        builder.Property(s => s.ShortBio).HasMaxLength(1000);
        builder.Property(s => s.Religion).HasMaxLength(50);
        builder.Property(s => s.Gender).HasConversion<string>();
        builder.Property(s => s.BloodGroup).HasConversion<string>();

        builder.HasOne(s => s.Class).WithMany(c => c.Students).HasForeignKey(s => s.ClassId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(s => s.Section).WithMany(sec => sec.Students).HasForeignKey(s => s.SectionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(s => s.Parent).WithMany(p => p.Students).HasForeignKey(s => s.ParentId).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(s => s.ClassId);
        builder.HasIndex(s => s.SectionId);
        builder.HasIndex(s => s.ParentId);
        builder.HasIndex(s => s.Email);
        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}

public class TeacherConfiguration : IEntityTypeConfiguration<Teacher>
{
    public void Configure(EntityTypeBuilder<Teacher> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(t => t.LastName).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Email).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Phone).HasMaxLength(20);
        builder.Property(t => t.PhotoUrl).HasMaxLength(500);
        builder.Property(t => t.Address).HasMaxLength(500);
        builder.Property(t => t.Religion).HasMaxLength(50);
        builder.Property(t => t.Gender).HasConversion<string>();

        builder.HasOne(t => t.Subject).WithMany(s => s.Teachers).HasForeignKey(t => t.SubjectId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(t => t.Class).WithMany(c => c.Teachers).HasForeignKey(t => t.ClassId).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(t => t.ClassId);
        builder.HasIndex(t => t.SubjectId);
        builder.HasIndex(t => t.Email);
        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}

public class ParentConfiguration : IEntityTypeConfiguration<Parent>
{
    public void Configure(EntityTypeBuilder<Parent> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Email).HasMaxLength(200);
        builder.Property(p => p.Phone).HasMaxLength(20);
        builder.Property(p => p.Occupation).HasMaxLength(100);
        builder.Property(p => p.PhotoUrl).HasMaxLength(500);
        builder.Property(p => p.Address).HasMaxLength(500);
        builder.HasIndex(p => p.Email);
        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}

public class ClassConfiguration : IEntityTypeConfiguration<Class>
{
    public void Configure(EntityTypeBuilder<Class> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}

public class SectionConfiguration : IEntityTypeConfiguration<Section>
{
    public void Configure(EntityTypeBuilder<Section> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.HasOne(s => s.Class).WithMany(c => c.Sections).HasForeignKey(s => s.ClassId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(s => s.ClassId);
        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}

public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.SubjectType).IsRequired().HasMaxLength(50);
        builder.Property(s => s.SubjectCode).HasMaxLength(20);
        builder.HasOne(s => s.Class).WithMany(c => c.Subjects).HasForeignKey(s => s.ClassId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(s => s.ClassId);
        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}

public class ClassRoutineConfiguration : IEntityTypeConfiguration<ClassRoutine>
{
    public void Configure(EntityTypeBuilder<ClassRoutine> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Day).IsRequired().HasMaxLength(20);
        builder.Property(r => r.TimeSlot).IsRequired().HasMaxLength(30);
        builder.HasOne(r => r.Subject).WithMany(s => s.ClassRoutines).HasForeignKey(r => r.SubjectId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(r => r.Class).WithMany().HasForeignKey(r => r.ClassId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(r => r.Section).WithMany().HasForeignKey(r => r.SectionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(r => r.Teacher).WithMany(t => t.ClassRoutines).HasForeignKey(r => r.TeacherId).OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(r => new { r.ClassId, r.SectionId, r.Day });
        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}

public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
{
    public void Configure(EntityTypeBuilder<Attendance> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Remarks).HasMaxLength(500);
        builder.HasOne(a => a.Student).WithMany(s => s.Attendances).HasForeignKey(a => a.StudentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.Class).WithMany().HasForeignKey(a => a.ClassId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.Section).WithMany().HasForeignKey(a => a.SectionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(a => new { a.StudentId, a.Date });
        builder.HasIndex(a => new { a.ClassId, a.SectionId, a.Date });
        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.HasOne(e => e.Subject).WithMany(s => s.Exams).HasForeignKey(e => e.SubjectId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.Class).WithMany(c => c.Exams).HasForeignKey(e => e.ClassId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.Section).WithMany().HasForeignKey(e => e.SectionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(e => new { e.ClassId, e.SectionId, e.ExamDate });
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}

public class ExamGradeConfiguration : IEntityTypeConfiguration<ExamGrade>
{
    public void Configure(EntityTypeBuilder<ExamGrade> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Grade).HasMaxLength(5);
        builder.Property(g => g.Remarks).HasMaxLength(500);
        builder.Property(g => g.MarksObtained).HasPrecision(5, 2);
        builder.HasOne(g => g.Exam).WithMany(e => e.ExamGrades).HasForeignKey(g => g.ExamId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(g => g.Student).WithMany(s => s.ExamGrades).HasForeignKey(g => g.StudentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(g => new { g.ExamId, g.StudentId }).IsUnique();
        builder.HasQueryFilter(g => !g.IsDeleted);
    }
}

public class FeeConfiguration : IEntityTypeConfiguration<Fee>
{
    public void Configure(EntityTypeBuilder<Fee> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.FeeType).IsRequired().HasMaxLength(100);
        builder.Property(f => f.Amount).HasPrecision(12, 2);
        builder.Property(f => f.Remarks).HasMaxLength(500);
        builder.Property(f => f.Status).HasConversion<string>();
        builder.HasOne(f => f.Student).WithMany(s => s.Fees).HasForeignKey(f => f.StudentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(f => f.StudentId);
        builder.HasIndex(f => f.Status);
        builder.HasQueryFilter(f => !f.IsDeleted);
    }
}

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.ExpenseType).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Amount).HasPrecision(12, 2);
        builder.Property(e => e.Status).HasConversion<string>();
        builder.Property(e => e.Phone).HasMaxLength(20);
        builder.Property(e => e.Email).HasMaxLength(200);
        builder.Property(e => e.PhotoUrl).HasMaxLength(500);
        builder.Property(e => e.Remarks).HasMaxLength(500);
        builder.HasIndex(e => e.Status);
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}

public class TransportConfiguration : IEntityTypeConfiguration<Transport>
{
    public void Configure(EntityTypeBuilder<Transport> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.RouteTitle).IsRequired().HasMaxLength(200);
        builder.Property(t => t.VehicleNo).IsRequired().HasMaxLength(50);
        builder.Property(t => t.DriverName).IsRequired().HasMaxLength(100);
        builder.Property(t => t.DriverPhone).IsRequired().HasMaxLength(20);
        builder.Property(t => t.HelperName).HasMaxLength(100);
        builder.Property(t => t.HelperPhone).HasMaxLength(20);
        builder.Property(t => t.DriverLicense).HasMaxLength(50);
        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}

public class StudentTransportConfiguration : IEntityTypeConfiguration<StudentTransport>
{
    public void Configure(EntityTypeBuilder<StudentTransport> builder)
    {
        builder.HasKey(st => st.Id);
        builder.HasOne(st => st.Student).WithMany(s => s.StudentTransports).HasForeignKey(st => st.StudentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(st => st.Transport).WithMany(t => t.StudentTransports).HasForeignKey(st => st.TransportId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(st => new { st.StudentId, st.TransportId }).IsUnique();
        builder.HasQueryFilter(st => !st.IsDeleted);
    }
}

public class NoticeConfiguration : IEntityTypeConfiguration<Notice>
{
    public void Configure(EntityTypeBuilder<Notice> builder)
    {
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Details).IsRequired();
        builder.Property(n => n.PostedBy).IsRequired().HasMaxLength(200);
        builder.HasQueryFilter(n => !n.IsDeleted);
    }
}

public class TeacherPaymentConfiguration : IEntityTypeConfiguration<TeacherPayment>
{
    public void Configure(EntityTypeBuilder<TeacherPayment> builder)
    {
        builder.HasKey(tp => tp.Id);
        builder.Property(tp => tp.Amount).HasPrecision(12, 2);
        builder.Property(tp => tp.Notes).HasMaxLength(500);
        builder.Property(tp => tp.Status).HasConversion<string>();
        builder.HasOne(tp => tp.Teacher).WithMany(t => t.Payments).HasForeignKey(tp => tp.TeacherId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(tp => tp.TeacherId);
        builder.HasQueryFilter(tp => !tp.IsDeleted);
    }
}
