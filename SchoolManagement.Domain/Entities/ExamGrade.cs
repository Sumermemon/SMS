using SchoolManagement.Domain.Common;

namespace SchoolManagement.Domain.Entities;

public class ExamGrade : BaseEntity
{
    public int ExamId { get; set; }
    public Exam Exam { get; set; } = null!;
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public decimal MarksObtained { get; set; }
    public string? Grade { get; set; }    // A+, A, B, C, D, F
    public string? Remarks { get; set; }
}
