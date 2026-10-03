using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Domain.Enums;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.Infrastructure.Data;

/// <summary>
/// Handles database truncation and complete data seeding for the multi-tenant system.
/// Seed order:
///   1. Truncate (optional, controlled by flag)
///   2. Seed permissions
///   3. Seed SuperAdmin role + user
///   4. Seed demo tenant
///   5. Seed demo tenant admin user + all permissions for tenant
///   6. Seed demo tenant roles (Admin, HeadMaster, Accountant, ClassTeacher)
/// </summary>
public static class DbSeeder
{
    // ── Credentials (change in production via environment variables) ──────────
    private const string SuperAdminEmail    = "superadmin@system.com";
    private const string SuperAdminPassword = "SuperAdmin@1234";

    private const string DemoAdminEmail    = "admin@school.com";
    private const string DemoAdminPassword = "Admin@1234";

    private const string DemoTenantName = "Bright Future Academy";
    private const string DemoTenantSlug = "bfa";

    // ── Entry Point ───────────────────────────────────────────────────────────
    public static async Task SeedAsync(IServiceProvider serviceProvider, bool truncateFirst = false)
    {
        using var scope = serviceProvider.CreateScope();
        var db          = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var logger      = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        logger.LogInformation("DbSeeder: Starting seed process (truncate={Truncate})", truncateFirst);

        if (truncateFirst)
            await TruncateAllAsync(db, userManager, roleManager, logger);

        await EnsureSchemaUpdatedAsync(db, logger);
        await SeedPermissionsAsync(db, logger);
        await SeedSuperAdminAsync(roleManager, userManager, logger);
        await SeedCmsSettingsAsync(db, logger);
        await SeedDemoTenantAsync(db, roleManager, userManager, logger);

        logger.LogInformation("DbSeeder: Seed process completed successfully.");
    }

    private static async Task EnsureSchemaUpdatedAsync(AppDbContext db, ILogger logger)
    {
        try
        {
            // Drop any wrongly-cased columns from a previous DbSeeder version that used
            // quoted PascalCase names instead of the snake_case EF Core convention.
            await db.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE tenants DROP COLUMN IF EXISTS ""SmtpHost"";
                ALTER TABLE tenants DROP COLUMN IF EXISTS ""SmtpPort"";
                ALTER TABLE tenants DROP COLUMN IF EXISTS ""SmtpUsername"";
                ALTER TABLE tenants DROP COLUMN IF EXISTS ""SmtpPassword"";
                ALTER TABLE tenants DROP COLUMN IF EXISTS ""SmtpSenderEmail"";
                ALTER TABLE tenants DROP COLUMN IF EXISTS ""SmtpSenderName"";
                ALTER TABLE tenants DROP COLUMN IF EXISTS ""SmtpEnableSsl"";
                ALTER TABLE notices DROP COLUMN IF EXISTS ""TargetAudience"";
                ALTER TABLE notices DROP COLUMN IF EXISTS ""TargetClassId"";
            ");
        }
        catch { /* ignore if tables don't exist yet */ }

        try
        {
            // Column names must be snake_case to match EF Core's ToSnakeCase convention
            // applied in AppDbContext.OnModelCreating. Unquoted names are case-folded to
            // lowercase by PostgreSQL, which matches the snake_case identifiers EF generates.
            await db.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_host text;
                ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_port integer NOT NULL DEFAULT 587;
                ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_username text;
                ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_password text;
                ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_sender_email text;
                ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_sender_name text;
                ALTER TABLE tenants ADD COLUMN IF NOT EXISTS smtp_enable_ssl boolean NOT NULL DEFAULT true;

                ALTER TABLE notices ADD COLUMN IF NOT EXISTS target_audience text NOT NULL DEFAULT 'Global';
                ALTER TABLE notices ADD COLUMN IF NOT EXISTS target_class_id integer REFERENCES classes(id) ON DELETE SET NULL;

                ALTER TABLE teachers ADD COLUMN IF NOT EXISTS assigned_subject_ids text;
                ALTER TABLE teachers ADD COLUMN IF NOT EXISTS assigned_class_ids text;

                ALTER TABLE parents ALTER COLUMN email DROP NOT NULL;
            ");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "DbSeeder: Schema update statement skipped or already applied.");
        }
    }

    // ── 1. Truncate ───────────────────────────────────────────────────────────
    private static async Task TruncateAllAsync(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<AppRole> roleManager,
        ILogger logger)
    {
        logger.LogWarning("DbSeeder: TRUNCATING ALL DATA...");

        // Disable constraints, delete in safe order, re-enable
        await db.Database.ExecuteSqlRawAsync("SET session_replication_role = 'replica';");

        var tables = new[]
        {
            "student_transports","attendances","exam_grades","fees","teacher_payments",
            "class_routines","exams","subjects","sections","students","parents",
            "teachers","notices","expenses","transports","classes",
            "tenant_permissions","permissions","tenants","system_settings",
            "asp_net_user_roles","asp_net_user_claims","asp_net_user_logins","asp_net_user_tokens",
            "asp_net_role_claims","asp_net_users","asp_net_roles"
        };

        foreach (var table in tables)
        {
            try
            {
#pragma warning disable EF1002
                await db.Database.ExecuteSqlRawAsync($"TRUNCATE TABLE \"{table}\" RESTART IDENTITY CASCADE;");
#pragma warning restore EF1002
                logger.LogDebug("DbSeeder: Truncated {Table}", table);
            }
            catch (Exception ex)
            {
                logger.LogWarning("DbSeeder: Could not truncate {Table}: {Msg}", table, ex.Message);
            }
        }

        await db.Database.ExecuteSqlRawAsync("SET session_replication_role = 'DEFAULT';");
        logger.LogWarning("DbSeeder: All tables truncated.");
    }

    // ── 2. Seed Permissions ───────────────────────────────────────────────────
    private static async Task SeedPermissionsAsync(AppDbContext db, ILogger logger)
    {
        var allPerms = Permissions.GetAll().ToList();
        var existing = await db.Permissions.Select(p => p.Name).ToListAsync();

        var toAdd = allPerms
            .Where(p => !existing.Contains(p.Name))
            .Select(p => new Permission
            {
                Name        = p.Name,
                DisplayName = p.DisplayName,
                Module      = p.Module
            })
            .ToList();

        if (toAdd.Count > 0)
        {
            await db.Permissions.AddRangeAsync(toAdd);
            await db.SaveChangesAsync();
            logger.LogInformation("DbSeeder: Seeded {Count} permissions.", toAdd.Count);
        }
        else
        {
            logger.LogInformation("DbSeeder: Permissions already seeded.");
        }
    }

    // ── 3. Seed SuperAdmin ────────────────────────────────────────────────────
    private static async Task SeedSuperAdminAsync(
        RoleManager<AppRole> roleManager,
        UserManager<ApplicationUser> userManager,
        ILogger logger)
    {
        // Create SuperAdmin role
        const string superAdminRoleName = "SuperAdmin";
        if (!await roleManager.RoleExistsAsync(superAdminRoleName))
        {
            var role = new AppRole(superAdminRoleName)
            {
                TenantId    = null,
                Description = "Platform-level super administrator with unrestricted access."
            };
            var result = await roleManager.CreateAsync(role);
            if (result.Succeeded)
                logger.LogInformation("DbSeeder: Created role 'SuperAdmin'.");
            else
                logger.LogError("DbSeeder: Failed to create SuperAdmin role: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        // Add all permission claims to SuperAdmin role
        var superAdminRole = await roleManager.FindByNameAsync(superAdminRoleName);
        if (superAdminRole != null)
        {
            var existingClaims = await roleManager.GetClaimsAsync(superAdminRole);
            foreach (var (permName, _, _) in Permissions.GetAll())
            {
                if (!existingClaims.Any(c => c.Type == "permission" && c.Value == permName))
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("permission", permName));
            }
        }

        // Create SuperAdmin user
        var existingUser = await userManager.FindByEmailAsync(SuperAdminEmail);
        if (existingUser == null)
        {
            var user = new ApplicationUser
            {
                UserName      = SuperAdminEmail,
                Email         = SuperAdminEmail,
                EmailConfirmed = true,
                FirstName     = "Platform",
                LastName      = "SuperAdmin",
                Role          = UserRole.SuperAdmin,
                IsSuperAdmin  = true,
                TenantId      = null,
                IsActive      = true
            };

            var result = await userManager.CreateAsync(user, SuperAdminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, superAdminRoleName);
                // Also add permission claims directly on the user as backup
                await userManager.AddClaimAsync(user, new System.Security.Claims.Claim("isSuperAdmin", "true"));
                logger.LogInformation("DbSeeder: Created SuperAdmin user '{Email}'.", SuperAdminEmail);
            }
            else
            {
                logger.LogError("DbSeeder: Failed to create SuperAdmin user: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            logger.LogInformation("DbSeeder: SuperAdmin user already exists.");
        }
    }

    // ── 4. Seed Demo Tenant ───────────────────────────────────────────────────
    private static async Task SeedDemoTenantAsync(
        AppDbContext db,
        RoleManager<AppRole> roleManager,
        UserManager<ApplicationUser> userManager,
        ILogger logger)
    {
        // Create demo tenant
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.SlugCode == DemoTenantSlug);
        if (tenant == null)
        {
            tenant = new Tenant
            {
                Name         = DemoTenantName,
                SlugCode     = DemoTenantSlug,
                ContactEmail = DemoAdminEmail,
                Phone        = "+92-300-0000000",
                Address      = "123 School Road, Karachi, Pakistan",
                IsActive     = true
            };
            db.Tenants.Add(tenant);
            await db.SaveChangesAsync();
            logger.LogInformation("DbSeeder: Created demo tenant '{Name}' (Id={Id}).", tenant.Name, tenant.Id);
        }

        // Grant ALL permissions to the demo tenant
        var allPermissions = await db.Permissions.ToListAsync();
        var existingTenantPerms = await db.TenantPermissions
            .Where(tp => tp.TenantId == tenant.Id)
            .Select(tp => tp.PermissionId)
            .ToListAsync();

        var superAdmin = await userManager.FindByEmailAsync(SuperAdminEmail);
        var grantedBy = superAdmin?.Id ?? "system";

        var toGrant = allPermissions
            .Where(p => !existingTenantPerms.Contains(p.Id))
            .Select(p => new TenantPermission
            {
                TenantId     = tenant.Id,
                PermissionId = p.Id,
                GrantedBy    = grantedBy
            })
            .ToList();

        if (toGrant.Count > 0)
        {
            await db.TenantPermissions.AddRangeAsync(toGrant);
            await db.SaveChangesAsync();
            logger.LogInformation("DbSeeder: Granted {Count} permissions to tenant '{Name}'.", toGrant.Count, tenant.Name);
        }

        // Seed demo tenant roles
        await SeedTenantRolesAsync(roleManager, tenant.Id, logger);

        // Seed demo admin user for the tenant
        await SeedDemoAdminUserAsync(userManager, roleManager, tenant.Id, logger);
    }

    // ── 5. Seed Tenant Roles ──────────────────────────────────────────────────
    private static async Task SeedTenantRolesAsync(
        RoleManager<AppRole> roleManager,
        int tenantId,
        ILogger logger)
    {
        var roleDefs = new[]
        {
            ("Admin",        "Full administrative access to the tenant."),
            ("HeadMaster",   "Academic oversight and staff management."),
            ("Accountant",   "Finance, fees and expenses management."),
            ("ClassTeacher", "Attendance, exams and grades for assigned class."),
        };

        // Permissions for each role
        var rolePermissions = new Dictionary<string, string[]>
        {
            ["Admin"] = Permissions.GetAll().Select(p => p.Name).Where(n => !n.StartsWith("tenants.")).ToArray(),
            ["HeadMaster"] = new[]
            {
                Permissions.Students.View, Permissions.Students.Create, Permissions.Students.Edit,
                Permissions.Teachers.View, Permissions.Teachers.Create, Permissions.Teachers.Edit,
                Permissions.Classes.View, Permissions.Classes.Create,
                Permissions.Sections.View, Permissions.Sections.Create,
                Permissions.Subjects.View, Permissions.Exams.View, Permissions.Exams.Create,
                Permissions.Attendance.View, Permissions.Reports.View,
                Permissions.Notices.View, Permissions.Notices.Create
            },
            ["Accountant"] = new[]
            {
                Permissions.Fees.View, Permissions.Fees.Create, Permissions.Fees.Edit,
                Permissions.Expenses.View, Permissions.Expenses.Create, Permissions.Expenses.Edit,
                Permissions.Teachers.View, Permissions.Reports.View
            },
            ["ClassTeacher"] = new[]
            {
                Permissions.Students.View,
                Permissions.Attendance.View, Permissions.Attendance.Create, Permissions.Attendance.Edit,
                Permissions.Exams.View, Permissions.Exams.Create,
                Permissions.Notices.View,
                Permissions.Reports.View
            }
        };

        foreach (var (roleName, description) in roleDefs)
        {
            // Role names are namespaced by tenant to avoid conflicts: "bfa_Admin"
            var scopedRoleName = $"T{tenantId}_{roleName}";

            if (!await roleManager.RoleExistsAsync(scopedRoleName))
            {
                var role = new AppRole(scopedRoleName)
                {
                    TenantId    = tenantId,
                    Description = description
                };
                var result = await roleManager.CreateAsync(role);
                if (!result.Succeeded)
                {
                    logger.LogError("DbSeeder: Failed to create role '{Role}': {Errors}",
                        scopedRoleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                    continue;
                }
                logger.LogInformation("DbSeeder: Created role '{Role}'.", scopedRoleName);
            }

            // Add permission claims to role
            var appRole = await roleManager.FindByNameAsync(scopedRoleName);
            if (appRole != null && rolePermissions.TryGetValue(roleName, out var perms))
            {
                var existingClaims = await roleManager.GetClaimsAsync(appRole);
                foreach (var perm in perms)
                {
                    if (!existingClaims.Any(c => c.Type == "permission" && c.Value == perm))
                        await roleManager.AddClaimAsync(appRole, new System.Security.Claims.Claim("permission", perm));
                }
            }
        }
    }

    // ── 6. Seed Demo Admin User ───────────────────────────────────────────────
    private static async Task SeedDemoAdminUserAsync(
        UserManager<ApplicationUser> userManager,
        RoleManager<AppRole> roleManager,
        int tenantId,
        ILogger logger)
    {
        var existingUser = await userManager.FindByEmailAsync(DemoAdminEmail);
        if (existingUser == null)
        {
            var user = new ApplicationUser
            {
                UserName       = DemoAdminEmail,
                Email          = DemoAdminEmail,
                EmailConfirmed = true,
                FirstName      = "School",
                LastName       = "Administrator",
                Role           = UserRole.Admin,
                IsSuperAdmin   = false,
                TenantId       = tenantId,
                IsActive       = true
            };

            var result = await userManager.CreateAsync(user, DemoAdminPassword);
            if (result.Succeeded)
            {
                var adminRoleName = $"T{tenantId}_Admin";
                await userManager.AddToRoleAsync(user, adminRoleName);
                await userManager.AddClaimAsync(user, new System.Security.Claims.Claim("tenantId", tenantId.ToString()));
                logger.LogInformation("DbSeeder: Created demo admin user '{Email}' for tenant {TenantId}.", DemoAdminEmail, tenantId);
            }
            else
            {
                logger.LogError("DbSeeder: Failed to create demo admin: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            logger.LogInformation("DbSeeder: Demo admin user already exists.");
        }
    }

    // ── 7. Seed CMS & System Settings ─────────────────────────────────────────
    private static async Task SeedCmsSettingsAsync(AppDbContext db, ILogger logger)
    {
        var existing = await db.SystemSettings.FirstOrDefaultAsync();
        if (existing == null)
        {
            var settings = new SystemSetting
            {
                SiteName       = "EduManage",
                SiteTagline    = "Next-Gen School Management Platform",
                LogoUrl        = "",
                ContactEmail   = "support@edumanage.com",
                ContactPhone   = "+1 (800) 555-0199",
                Address        = "100 Innovation Way, Suite 400, Silicon Valley, CA",
                FooterText     = "© 2026 EduManage Technologies Inc. All rights reserved.",
                FacebookUrl    = "https://facebook.com/edumanage",
                TwitterUrl     = "https://twitter.com/edumanage",
                InstagramUrl   = "https://instagram.com/edumanage",
                LinkedInUrl    = "https://linkedin.com/company/edumanage",
                YouTubeUrl     = "https://youtube.com/@edumanage",
                GitHubUrl      = "https://github.com/edumanage",
                SmtpHost       = "smtp.mailgun.org",
                SmtpPort       = 587,
                SmtpUsername   = "postmaster@edumanage.com",
                SmtpPassword   = "smtp_demo_secret",
                SmtpSenderEmail= "notifications@edumanage.com",
                SmtpSenderName = "EduManage System Mailer",
                SmtpEnableSsl  = true,
                UpdatedAt      = DateTime.UtcNow,
                UpdatedBy      = "system"
            };

            db.SystemSettings.Add(settings);
            await db.SaveChangesAsync();
            logger.LogInformation("DbSeeder: Seeded default CMS and platform settings.");
        }
    }

    // ── Legacy method kept for backward compatibility ─────────────────────────
    [Obsolete("Use SeedAsync instead.")]
    public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        => await SeedAsync(serviceProvider, truncateFirst: false);
}
