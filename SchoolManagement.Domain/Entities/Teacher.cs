using SchoolManagement.Domain.Common;
using SchoolManagement.Domain.Enums;

namespace SchoolManagement.Domain.Entities;

public class Teacher : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Religion { get; set; }
    public DateOnly JoiningDate { get; set; }
    public int? SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public int? ClassId { get; set; }
    public Class? Class { get; set; }
    public int? SectionId { get; set; }
    public Section? Section { get; set; }
    public string? UserId { get; set; }  // Link to ApplicationUser
    public ICollection<ClassRoutine> ClassRoutines { get; set; } = new List<ClassRoutine>();
    public ICollection<TeacherPayment> Payments { get; set; } = new List<TeacherPayment>();
}
