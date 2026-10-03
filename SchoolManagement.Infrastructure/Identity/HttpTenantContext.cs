using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace SchoolManagement.Infrastructure.Identity;

/// <summary>
/// Reads TenantId and SuperAdmin flag from the current HTTP context's JWT claims.
/// </summary>
public class HttpTenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpTenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int TenantId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User
                .FindFirstValue("tenantId");
            return int.TryParse(claim, out var id) ? id : 0;
        }
    }

    public bool IsSuperAdmin
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            // Outside of an HTTP request (startup, seeding, background tasks), treat as system administrative context
            if (httpContext == null) return true;

            var claim = httpContext.User.FindFirstValue("isSuperAdmin");
            return claim == "true";
        }
    }
}
