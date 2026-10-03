using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SchoolManagement.API.Authorization;
using SchoolManagement.API.Middleware;
using SchoolManagement.Application.Interfaces.Repositories;
using SchoolManagement.Application.Interfaces.Services;
using SchoolManagement.Application.Services;
using SchoolManagement.Infrastructure.Data;
using SchoolManagement.Infrastructure.Identity;
using SchoolManagement.Infrastructure.Repositories;
using SchoolManagement.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ────────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured. " +
        "Set it via user-secrets (dev) or environment variables (prod).");

builder.Services.AddHttpContextAccessor();

// Register ITenantContext before DbContext so it can be injected into AppDbContext
builder.Services.AddScoped<ITenantContext, HttpTenantContext>();

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    options.UseNpgsql(connectionString);
    // Schema additions (SMTP, Notice audience, etc.) are applied at startup via
    // DbSeeder.EnsureSchemaUpdatedAsync using idempotent ALTER TABLE ... IF NOT EXISTS,
    // so EF Core's pending-changes check is suppressed to avoid a false-positive crash.
    options.ConfigureWarnings(w =>
        w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// ─── ASP.NET Core Identity (with AppRole) ────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, AppRole>(options =>
{
    options.Password.RequireDigit            = true;
    options.Password.RequiredLength          = 8;
    options.Password.RequireNonAlphanumeric  = false;
    options.Password.RequireUppercase        = false;

    options.Lockout.MaxFailedAccessAttempts  = 5;
    options.Lockout.DefaultLockoutTimeSpan   = TimeSpan.FromMinutes(15);
    options.Lockout.AllowedForNewUsers       = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ─── JWT Authentication ───────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];
if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 32)
    throw new InvalidOperationException(
        "JwtSettings:SecretKey is missing or too short (must be >= 32 characters). " +
        "Set it via user-secrets (dev) or environment variables (prod).");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtSettings["Issuer"],
        ValidAudience            = jwtSettings["Audience"],
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        RoleClaimType            = System.Security.Claims.ClaimTypes.Role,
        NameClaimType            = System.Security.Claims.ClaimTypes.NameIdentifier,
    };
});

// ─── Authorization (Permission-based policies) ───────────────────────────────
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
PolicyRegistrar.RegisterAll(builder.Services);

// ─── Repositories (N-Tier: Infrastructure) ───────────────────────────────────
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<ITeacherRepository, TeacherRepository>();
builder.Services.AddScoped<IParentRepository, ParentRepository>();
builder.Services.AddScoped<IClassRepository, ClassRepository>();
builder.Services.AddScoped<ISectionRepository, SectionRepository>();
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<IClassRoutineRepository, ClassRoutineRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
builder.Services.AddScoped<IExamRepository, ExamRepository>();
builder.Services.AddScoped<IExamGradeRepository, ExamGradeRepository>();
builder.Services.AddScoped<IFeeRepository, FeeRepository>();
builder.Services.AddScoped<IExpenseRepository, ExpenseRepository>();
builder.Services.AddScoped<ITransportRepository, TransportRepository>();
builder.Services.AddScoped<INoticeRepository, NoticeRepository>();
builder.Services.AddScoped<ITeacherPaymentRepository, TeacherPaymentRepository>();

// ─── Application Services ─────────────────────────────────────────────────────
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<ITeacherPaymentService, TeacherPaymentService>();
builder.Services.AddScoped<IParentService, ParentService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<ISectionService, SectionService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IClassRoutineService, ClassRoutineService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IExamGradeService, ExamGradeService>();
builder.Services.AddScoped<IFeeService, FeeService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<ITransportService, TransportService>();
builder.Services.AddScoped<INoticeService, NoticeService>();

// ─── Multi-Tenant & Platform Services ─────────────────────────────────────────
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<ICmsService, CmsService>();

// ─── Validators ──────────────────────────────────────────────────────────────
builder.Services.AddValidatorsFromAssemblyContaining<StudentService>();

// ─── Controllers & Swagger ───────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "School Management API — Multi-Tenant",
        Version     = "v1",
        Description = "Multi-tenant school management system. SuperAdmin manages tenants; " +
                      "Tenant Admins manage roles, users, and school data."
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer {token}'",
        Name        = "Authorization",
        In          = ParameterLocation.Header,
        Type        = SecuritySchemeType.ApiKey,
        Scheme      = "Bearer",
        Reference   = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { securityScheme, Array.Empty<string>() } });
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// ─── Middleware pipeline ──────────────────────────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ─── Auto-migrate + seed on startup ──────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

// Seed: permissions + SuperAdmin + demo tenant
// Set truncateFirst: true to WIPE all data and re-seed from scratch
// Set truncateFirst: false (default) to only add missing seed data
var truncate = app.Environment.IsDevelopment() &&
               bool.TryParse(app.Configuration["Seeder:TruncateOnStart"], out var t) && t;
await SchoolManagement.Infrastructure.Data.DbSeeder.SeedAsync(app.Services, truncateFirst: truncate);

app.MapFallbackToFile("index.html");

app.Run();
