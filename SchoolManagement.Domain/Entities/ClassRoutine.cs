using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class ClassRoutine : BaseEntity
{
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public int SectionId { get; set; }
    public Section Section { get; set; } = null!;
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public string Day { get; set; } = string.Empty; // Monday, Tuesday, etc.
    public string TimeSlot { get; set; } = string.Empty; // e.g. "08:00-09:00"
    public DateOnly? EffectiveDate { get; set; }
}
