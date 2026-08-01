using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class Section : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public ICollection<Student> Students { get; set; } = new List<Student>();
}
