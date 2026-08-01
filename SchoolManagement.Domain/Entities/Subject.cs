using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class Subject : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string SubjectType { get; set; } = string.Empty; // e.g. "Theory", "Practical"
    public string? SubjectCode { get; set; }
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public ICollection<ClassRoutine> ClassRoutines { get; set; } = new List<ClassRoutine>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
}
