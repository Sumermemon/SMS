using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagement.Application.DTOs.Parents;
using SchoolManagement.Application.DTOs.Classes;
using SchoolManagement.Application.DTOs.Routines;
using SchoolManagement.Application.DTOs.Attendance;
using SchoolManagement.Application.DTOs.Exams;
using SchoolManagement.Application.DTOs.Accounts;
using SchoolManagement.Application.DTOs.Transport;
using SchoolManagement.Application.DTOs.Notices;
using SchoolManagement.Application.Interfaces.Services;

namespace SchoolManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ParentsController : ControllerBase
{
    private readonly IParentService _service;
    public ParentsController(IParentService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20) => Ok(await _service.GetAllAsync(page, pageSize));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateParentDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateParentDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClassesController : ControllerBase
{
    private readonly IClassService _service;
    public ClassesController(IClassService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateClassDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateClassDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SectionsController : ControllerBase
{
    private readonly ISectionService _service;
    public SectionsController(ISectionService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] int? classId) => Ok(await _service.GetAllAsync(classId));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateSectionDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateSectionDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _service;
    public SubjectsController(ISubjectService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] int? classId) => Ok(await _service.GetAllAsync(classId));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateSubjectDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateSubjectDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/class-routines")]
[Authorize]
public class ClassRoutinesController : ControllerBase
{
    private readonly IClassRoutineService _service;
    public ClassRoutinesController(IClassRoutineService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] int? classId, [FromQuery] string? day, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) => Ok(await _service.GetAllAsync(classId, day, page, pageSize));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateClassRoutineDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateClassRoutineDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;
    public AttendanceController(IAttendanceService service) => _service = service;

    [HttpGet("sheet")]
    public async Task<IActionResult> GetSheet([FromQuery] int classId, [FromQuery] int sectionId, [FromQuery] int month, [FromQuery] int year)
        => Ok(await _service.GetAttendanceSheetAsync(classId, sectionId, month, year));

    [HttpGet("student/{studentId:int}")]
    public async Task<IActionResult> GetByStudent(int studentId)
        => Ok(await _service.GetByStudentAsync(studentId));

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> MarkAttendance([FromBody] MarkAttendanceDto dto)
    {
        await _service.MarkAttendanceAsync(dto);
        return Ok(new { message = "Attendance marked successfully" });
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExamsController : ControllerBase
{
    private readonly IExamService _service;
    public ExamsController(IExamService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] int? classId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) => Ok(await _service.GetAllAsync(classId, page, pageSize));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateExamDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateExamDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/exam-grades")]
[Authorize]
public class ExamGradesController : ControllerBase
{
    private readonly IExamGradeService _service;
    public ExamGradesController(IExamGradeService service) => _service = service;

    [HttpGet("exam/{examId:int}")] public async Task<IActionResult> GetByExam(int examId) => Ok(await _service.GetByExamIdAsync(examId));
    [HttpGet("student/{studentId:int}")] public async Task<IActionResult> GetByStudent(int studentId) => Ok(await _service.GetByStudentIdAsync(studentId));
    [HttpPost][Authorize(Roles = "Admin,Teacher")] public async Task<IActionResult> BulkCreate([FromBody] BulkCreateExamGradeDto dto) { await _service.BulkCreateAsync(dto); return Ok(new { message = "Grades saved" }); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin,Teacher")] public async Task<IActionResult> Update(int id, [FromBody] CreateExamGradeDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeesController : ControllerBase
{
    private readonly IFeeService _service;
    public FeesController(IFeeService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] int? studentId, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) => Ok(await _service.GetAllAsync(studentId, status, page, pageSize));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateFeeDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateFeeDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _service;
    public ExpensesController(IExpenseService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) => Ok(await _service.GetAllAsync(status, page, pageSize));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateExpenseDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateExpenseDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransportController : ControllerBase
{
    private readonly ITransportService _service;
    public TransportController(ITransportService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20) => Ok(await _service.GetAllAsync(page, pageSize));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateTransportDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateTransportDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NoticesController : ControllerBase
{
    private readonly INoticeService _service;
    public NoticesController(INoticeService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) => Ok(await _service.GetAllAsync(search, page, pageSize));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) { var r = await _service.GetByIdAsync(id); return r == null ? NotFound() : Ok(r); }
    [HttpPost][Authorize(Roles = "Admin")] public async Task<IActionResult> Create([FromBody] CreateNoticeDto dto) { var r = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = r.Id }, r); }
    [HttpPut("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Update(int id, [FromBody] UpdateNoticeDto dto) { var r = await _service.UpdateAsync(id, dto); return r == null ? NotFound() : Ok(r); }
    [HttpDelete("{id:int}")][Authorize(Roles = "Admin")] public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
