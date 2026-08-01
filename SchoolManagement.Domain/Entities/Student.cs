using SchoolManagement.Domain.Common;
using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Domain.Entities;

public class Student : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public int Roll { get; set; }
    public BloodGroup BloodGroup { get; set; }
    public string? Religion { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhotoUrl { get; set; }
    public string? AdmissionId { get; set; }
    public string? ShortBio { get; set; }
    public DateOnly AdmissionDate { get; set; }
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public int SectionId { get; set; }
    public Section Section { get; set; } = null!;
    public int? ParentId { get; set; }
    public Parent? Parent { get; set; }
    public string? UserId { get; set; }  // Link to ApplicationUser
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<ExamGrade> ExamGrades { get; set; } = new List<ExamGrade>();
    public ICollection<Fee> Fees { get; set; } = new List<Fee>();
    public ICollection<StudentTransport> StudentTransports { get; set; } = new List<StudentTransport>();
}
