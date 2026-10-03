using Microsoft.AspNetCore.Authorization;

namespace SchoolManagement.API.Authorization;

/// <summary>
/// Requirement that a user must have a specific permission claim.
/// Used in conjunction with PermissionAuthorizationHandler.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }
    public PermissionRequirement(string permission) => Permission = permission;
}

/// <summary>
/// Handles PermissionRequirement by checking if the user's JWT claims
/// contain a "permission" claim with the required value.
/// SuperAdmins (isSuperAdmin=true claim) bypass all permission checks.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // SuperAdmin bypasses all permission checks
        var isSuperAdmin = context.User.FindFirst("isSuperAdmin")?.Value == "true";
        if (isSuperAdmin)
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Check for permission claim from role claims (loaded via AddRoleClaims in JWT)
        var hasPermission = context.User.Claims
            .Any(c => c.Type == "permission" && c.Value == requirement.Permission);

        if (hasPermission)
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Policy names that match permission claim names.
/// Register all via PolicyRegistrar.RegisterAll().
/// </summary>
public static class PolicyRegistrar
{
    public static void RegisterAll(Microsoft.Extensions.DependencyInjection.IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // SuperAdmin-only policy
            options.AddPolicy("SuperAdminOnly", policy =>
                policy.RequireClaim("isSuperAdmin", "true"));

            // Admin can manage their tenant (has the Admin role in their tenant)
            options.AddPolicy("TenantAdmin", policy =>
                policy.RequireAssertion(ctx =>
                    ctx.User.FindFirst("isSuperAdmin")?.Value == "true" ||
                    ctx.User.Claims.Any(c => c.Type == "permission" && c.Value == "users.create")));

            // Register one policy per permission
            foreach (var (name, _, _) in SchoolManagement.Infrastructure.Identity.Permissions.GetAll())
            {
                options.AddPolicy(name, policy =>
                    policy.AddRequirements(new PermissionRequirement(name)));
            }
        });
    }
}
