using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SchoolManagement.Application.DTOs.Auth;
using SchoolManagement.Domain.Common;
using SchoolManagement.Infrastructure.Data;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<AppRole> _roleManager;
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        RoleManager<AppRole> roleManager,
        AppDbContext db,
        IConfiguration config,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _db = db;
        _config = config;
        _logger = logger;
    }

    /// <summary>Login and receive a JWT token with tenant + permission claims.</summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return Unauthorized(new { message = "Invalid credentials" });

        if (!user.IsActive)
            return Unauthorized(new { message = "Account has been deactivated. Contact your administrator." });

        // If user is a tenant user, verify tenant status
        if (!user.IsSuperAdmin && user.TenantId.HasValue)
        {
            var tenant = await _db.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Id == user.TenantId.Value);
            if (tenant == null || !tenant.IsActive)
                return Unauthorized(new { message = "School/Tenant account is inactive. Contact support." });

            if (tenant.PlanExpiryDate.HasValue && tenant.PlanExpiryDate.Value < DateTime.UtcNow)
                return Unauthorized(new { message = "School subscription has expired. Please renew." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
        if (result.IsLockedOut)
            return Unauthorized(new { message = "Account locked due to multiple failed sign-in attempts. Try again later." });
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid credentials" });

        // Update tenant last login
        if (user.TenantId.HasValue)
        {
            var t = await _db.Tenants.FindAsync(user.TenantId.Value);
            if (t != null)
            {
                t.LastLoginAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        var token = await GenerateJwtTokenAsync(user);
        _logger.LogInformation("User {Email} logged in (Tenant={TenantId}, SuperAdmin={IsSuperAdmin})",
            user.Email, user.TenantId, user.IsSuperAdmin);

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = user.IsSuperAdmin
            ? SystemRoles.SuperAdmin
            : (roles.FirstOrDefault()?.Contains('_') == true ? roles.First().Split('_')[1] : (roles.FirstOrDefault() ?? user.Role.ToString()));

        return Ok(new AuthResponseDto(
            token,
            string.Empty,
            user.Email ?? string.Empty,
            $"{user.FirstName} {user.LastName}",
            primaryRole,
            user.Id,
            user.TenantId,
            user.IsSuperAdmin
        ));
    }

    /// <summary>Get current user profile with live effective permissions and renewed JWT token.</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponseDto>> GetMe()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || !user.IsActive) return Unauthorized();

        var token = await GenerateJwtTokenAsync(user);
        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = user.IsSuperAdmin
            ? SystemRoles.SuperAdmin
            : (roles.FirstOrDefault()?.Contains('_') == true ? roles.First().Split('_')[1] : (roles.FirstOrDefault() ?? user.Role.ToString()));

        return Ok(new AuthResponseDto(
            token,
            string.Empty,
            user.Email ?? string.Empty,
            $"{user.FirstName} {user.LastName}",
            primaryRole,
            user.Id,
            user.TenantId,
            user.IsSuperAdmin
        ));
    }

    /// <summary>Register a new user within the current tenant (Admin only).</summary>
    [HttpPost("register")]
    [Authorize(Policy = "users.create")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null) return BadRequest(new { message = "Email already registered" });

        // Determine tenant context from current user's authenticated claims
        var tenantIdClaim = User.FindFirstValue("tenantId");
        int? tenantId = null;
        if (int.TryParse(tenantIdClaim, out var tid))
            tenantId = tid;

        var user = new ApplicationUser
        {
            Email          = dto.Email,
            UserName       = dto.Email,
            EmailConfirmed = true,
            FirstName      = dto.FirstName,
            LastName       = dto.LastName,
            Role           = dto.Role,
            TenantId       = tenantId,
            IsSuperAdmin   = false,
            IsActive       = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        // Assign scoped role
        var roleName = tenantId.HasValue
            ? $"T{tenantId}_{dto.Role}"
            : dto.Role.ToString();

        if (await _roleManager.RoleExistsAsync(roleName))
        {
            await _userManager.AddToRoleAsync(user, roleName);
        }

        if (tenantId.HasValue)
            await _userManager.AddClaimAsync(user, new Claim("tenantId", tenantId.Value.ToString()));

        var token = await GenerateJwtTokenAsync(user);
        return CreatedAtAction(nameof(Login),
            new AuthResponseDto(token, string.Empty, user.Email!, $"{user.FirstName} {user.LastName}",
                user.Role.ToString(), user.Id, user.TenantId, user.IsSuperAdmin));
    }

    private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var userRoles = await _userManager.GetRolesAsync(user);
        var primaryRole = user.IsSuperAdmin
            ? SystemRoles.SuperAdmin
            : (userRoles.FirstOrDefault()?.Contains('_') == true ? userRoles.First().Split('_')[1] : (userRoles.FirstOrDefault() ?? user.Role.ToString()));

        // Base claims
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,   user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
            new("fullName",                    $"{user.FirstName} {user.LastName}"),
            new("role",                        primaryRole),
            new(ClaimTypes.Role,               primaryRole),
            new("isSuperAdmin",                user.IsSuperAdmin ? "true" : "false"),
        };

        // Add tenantId only for non-SuperAdmin users
        if (user.TenantId.HasValue)
            claims.Add(new Claim("tenantId", user.TenantId.Value.ToString()));

        // ── Calculate Effective Permissions ─────────────────────────────────────
        if (user.IsSuperAdmin)
        {
            // SuperAdmin receives all system catalog permissions
            foreach (var (permName, _, _) in Permissions.GetAll())
            {
                claims.Add(new Claim("permission", permName));
            }
        }
        else if (user.TenantId.HasValue)
        {
            // 1. Fetch permissions granted to this tenant
            var tenantAllowedPerms = await _db.TenantPermissions
                .AsNoTracking()
                .Where(tp => tp.TenantId == user.TenantId.Value)
                .Select(tp => tp.Permission.Name)
                .ToListAsync();

            var tenantPermSet = new HashSet<string>(tenantAllowedPerms, StringComparer.OrdinalIgnoreCase);

            // 2. Fetch candidate permissions granted to user's assigned roles
            var candidatePerms = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var roleName in userRoles)
            {
                var role = await _roleManager.FindByNameAsync(roleName);
                if (role == null) continue;
                var roleClaims = await _roleManager.GetClaimsAsync(role);
                foreach (var claim in roleClaims.Where(c => c.Type == "permission"))
                {
                    candidatePerms.Add(claim.Value);
                }
            }

            // 3. User effective permissions = Role Permissions INTERSECT Tenant Allowed Permissions
            foreach (var perm in candidatePerms)
            {
                if (tenantPermSet.Contains(perm))
                {
                    claims.Add(new Claim("permission", perm));
                }
            }
        }

        var token = new JwtSecurityToken(
            issuer:            jwtSettings["Issuer"],
            audience:          jwtSettings["Audience"],
            claims:            claims,
            expires:           DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpiryMinutes"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
