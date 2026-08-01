using SchoolManagement.Application.DTOs.Parents;
using SchoolManagement.Application.DTOs.Classes;
using SchoolManagement.Application.DTOs.Routines;
using SchoolManagement.Application.DTOs.Attendance;
using SchoolManagement.Application.DTOs.Exams;
using SchoolManagement.Application.DTOs.Accounts;
using SchoolManagement.Application.DTOs.Transport;
using SchoolManagement.Application.DTOs.Notices;
using SchoolManagement.Application.DTOs.Common;

namespace SchoolManagement.Application.Interfaces.Services;

public interface IParentService
{
    Task<PagedResult<ParentDto>> GetAllAsync(int page, int pageSize);
    Task<ParentDto?> GetByIdAsync(int id);
    Task<ParentDto> CreateAsync(CreateParentDto dto);
    Task<ParentDto?> UpdateAsync(int id, UpdateParentDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IClassService
{
    Task<IEnumerable<ClassDto>> GetAllAsync();
    Task<ClassDto?> GetByIdAsync(int id);
    Task<ClassDto> CreateAsync(CreateClassDto dto);
    Task<ClassDto?> UpdateAsync(int id, UpdateClassDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface ISectionService
{
    Task<IEnumerable<SectionDto>> GetAllAsync(int? classId);
    Task<SectionDto?> GetByIdAsync(int id);
    Task<SectionDto> CreateAsync(CreateSectionDto dto);
    Task<SectionDto?> UpdateAsync(int id, UpdateSectionDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface ISubjectService
{
    Task<IEnumerable<SubjectDto>> GetAllAsync(int? classId);
    Task<SubjectDto?> GetByIdAsync(int id);
    Task<SubjectDto> CreateAsync(CreateSubjectDto dto);
    Task<SubjectDto?> UpdateAsync(int id, UpdateSubjectDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IClassRoutineService
{
    Task<PagedResult<ClassRoutineListDto>> GetAllAsync(int? classId, string? day, int page, int pageSize);
    Task<ClassRoutineListDto?> GetByIdAsync(int id);
    Task<ClassRoutineListDto> CreateAsync(CreateClassRoutineDto dto);
    Task<ClassRoutineListDto?> UpdateAsync(int id, UpdateClassRoutineDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IAttendanceService
{
    Task<IEnumerable<AttendanceSheetDto>> GetAttendanceSheetAsync(int classId, int sectionId, int month, int year);
    Task MarkAttendanceAsync(MarkAttendanceDto dto);
    Task<IEnumerable<AttendanceDto>> GetByStudentAsync(int studentId);
}

public interface IExamService
{
    Task<PagedResult<ExamListDto>> GetAllAsync(int? classId, int page, int pageSize);
    Task<ExamDetailDto?> GetByIdAsync(int id);
    Task<ExamDetailDto> CreateAsync(CreateExamDto dto);
    Task<ExamDetailDto?> UpdateAsync(int id, UpdateExamDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IExamGradeService
{
    Task<IEnumerable<ExamGradeDto>> GetByExamIdAsync(int examId);
    Task<IEnumerable<ExamGradeDto>> GetByStudentIdAsync(int studentId);
    Task BulkCreateAsync(BulkCreateExamGradeDto dto);
    Task<ExamGradeDto?> UpdateAsync(int id, CreateExamGradeDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IFeeService
{
    Task<PagedResult<FeeListDto>> GetAllAsync(int? studentId, string? status, int page, int pageSize);
    Task<FeeListDto?> GetByIdAsync(int id);
    Task<FeeListDto> CreateAsync(CreateFeeDto dto);
    Task<FeeListDto?> UpdateAsync(int id, UpdateFeeDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IExpenseService
{
    Task<PagedResult<ExpenseListDto>> GetAllAsync(string? status, int page, int pageSize);
    Task<ExpenseListDto?> GetByIdAsync(int id);
    Task<ExpenseListDto> CreateAsync(CreateExpenseDto dto);
    Task<ExpenseListDto?> UpdateAsync(int id, UpdateExpenseDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface ITransportService
{
    Task<PagedResult<TransportDto>> GetAllAsync(int page, int pageSize);
    Task<TransportDto?> GetByIdAsync(int id);
    Task<TransportDto> CreateAsync(CreateTransportDto dto);
    Task<TransportDto?> UpdateAsync(int id, UpdateTransportDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface INoticeService
{
    Task<PagedResult<NoticeDto>> GetAllAsync(string? search, int page, int pageSize);
    Task<NoticeDto?> GetByIdAsync(int id);
    Task<NoticeDto> CreateAsync(CreateNoticeDto dto);
    Task<NoticeDto?> UpdateAsync(int id, UpdateNoticeDto dto);
    Task<bool> DeleteAsync(int id);
}
