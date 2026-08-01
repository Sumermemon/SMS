namespace SchoolManagement.Application.DTOs.Transport;

public record TransportDto(
    int Id,
    string RouteTitle,
    string VehicleNo,
    string DriverName,
    string DriverPhone,
    string? HelperName,
    string? HelperPhone,
    string? DriverLicense,
    int StudentCount
);

public record CreateTransportDto(
    string RouteTitle,
    string VehicleNo,
    string DriverName,
    string DriverPhone,
    string? HelperName,
    string? HelperPhone,
    string? DriverLicense
);

public record UpdateTransportDto(
    string RouteTitle,
    string VehicleNo,
    string DriverName,
    string DriverPhone,
    string? HelperName,
    string? HelperPhone,
    string? DriverLicense
);
