namespace SchoolManagement.Application.DTOs.Routines;

public record ClassRoutineListDto(
    int Id,
    string Day,
    string ClassName,
    string SubjectName,
    string SectionName,
    string? TeacherName,
    string TimeSlot,
    string? EffectiveDate
);

public record CreateClassRoutineDto(
    int SubjectId,
    int ClassId,
    int SectionId,
    int? TeacherId,
    string Day,
    string TimeSlot,
    DateOnly? EffectiveDate
);

public record UpdateClassRoutineDto(
    int SubjectId,
    int ClassId,
    int SectionId,
    int? TeacherId,
    string Day,
    string TimeSlot,
    DateOnly? EffectiveDate
);
