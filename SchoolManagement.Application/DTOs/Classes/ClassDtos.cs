namespace SchoolManagement.Application.DTOs.Classes;

public record ClassDto(int Id, string Name, string? Note, int SectionCount, int StudentCount);
public record CreateClassDto(string Name, string? Note);
public record UpdateClassDto(string Name, string? Note);

public record SectionDto(int Id, string Name, int ClassId, string ClassName);
public record CreateSectionDto(string Name, int ClassId);
public record UpdateSectionDto(string Name, int ClassId);

public record SubjectDto(int Id, string Name, string SubjectType, string? SubjectCode, int ClassId, string ClassName);
public record CreateSubjectDto(string Name, string SubjectType, string? SubjectCode, int ClassId);
public record UpdateSubjectDto(string Name, string SubjectType, string? SubjectCode, int ClassId);
