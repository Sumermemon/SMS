using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class StudentTransport : BaseEntity
{
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int TransportId { get; set; }
    public Transport Transport { get; set; } = null!;
    public DateOnly EnrollDate { get; set; }
}
