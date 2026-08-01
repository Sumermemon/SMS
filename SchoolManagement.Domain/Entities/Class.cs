using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class Class : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Note { get; set; }
    public ICollection<Section> Sections { get; set; } = new List<Section>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
