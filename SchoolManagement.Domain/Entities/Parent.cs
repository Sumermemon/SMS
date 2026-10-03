using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class Parent : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Occupation { get; set; }
    public string? PhotoUrl { get; set; }
    public string? UserId { get; set; }    // Link to ApplicationUser
    public ICollection<Student> Students { get; set; } = new List<Student>();
}
