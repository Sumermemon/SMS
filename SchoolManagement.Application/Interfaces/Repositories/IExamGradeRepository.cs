using SchoolManagement.Domain.Entities;

namespace SchoolManagement.Application.Interfaces.Repositories;

public interface IExamGradeRepository
{
    Task<ExamGrade?> GetByIdAsync(int id);
    Task<IEnumerable<ExamGrade>> GetByExamIdAsync(int examId);
    Task<IEnumerable<ExamGrade>> GetByStudentIdAsync(int studentId);
    Task AddAsync(ExamGrade grade);
    Task AddRangeAsync(IEnumerable<ExamGrade> grades);
    Task UpdateAsync(ExamGrade grade);
    Task DeleteAsync(int id);
}
