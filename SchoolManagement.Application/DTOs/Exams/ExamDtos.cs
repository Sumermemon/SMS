namespace SchoolManagement.Application.DTOs.Exams;

public record ExamListDto(
    int Id,
    string ExamName,
    string SubjectName,
    string ClassName,
    string SectionName,
    string ExamTime,
    string ExamDate,
    bool IsPublished
);

public record ExamDetailDto(
    int Id,
    string Name,
    int SubjectId,
    string SubjectName,
    int ClassId,
    string ClassName,
    int SectionId,
    string SectionName,
    TimeOnly ExamTime,
    DateOnly ExamDate,
    int TotalMarks,
    bool IsPublished
);

public record CreateExamDto(
    string Name,
    int SubjectId,
    int ClassId,
    int SectionId,
    TimeOnly ExamTime,
    DateOnly ExamDate,
    int TotalMarks
);

public record UpdateExamDto(
    string Name,
    int SubjectId,
    int ClassId,
    int SectionId,
    TimeOnly ExamTime,
    DateOnly ExamDate,
    int TotalMarks,
    bool IsPublished
);

public record ExamGradeDto(
    int Id,
    int ExamId,
    string ExamName,
    int StudentId,
    string StudentName,
    decimal MarksObtained,
    string? Grade,
    string? Remarks
);

public record CreateExamGradeDto(
    int ExamId,
    int StudentId,
    decimal MarksObtained,
    string? Grade,
    string? Remarks
);

public record BulkCreateExamGradeDto(
    int ExamId,
    IEnumerable<CreateExamGradeDto> Grades
);
