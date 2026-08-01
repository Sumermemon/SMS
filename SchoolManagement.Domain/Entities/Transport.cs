using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class Transport : BaseEntity
{
    public string RouteTitle { get; set; } = string.Empty;
    public string VehicleNo { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string? HelperName { get; set; }
    public string? HelperPhone { get; set; }
    public string? DriverLicense { get; set; }
    public ICollection<StudentTransport> StudentTransports { get; set; } = new List<StudentTransport>();
}
