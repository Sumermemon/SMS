using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class Attendance : BaseEntity
{
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public int SectionId { get; set; }
    public Section Section { get; set; } = null!;
    public DateOnly Date { get; set; }
    public bool IsPresent { get; set; }
    public string? Remarks { get; set; }
}
