using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class Exam : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public int SectionId { get; set; }
    public Section Section { get; set; } = null!;
    public TimeOnly ExamTime { get; set; }
    public DateOnly ExamDate { get; set; }
    public int TotalMarks { get; set; } = 100;
    public bool IsPublished { get; set; } = false;
    public ICollection<ExamGrade> ExamGrades { get; set; } = new List<ExamGrade>();
}
