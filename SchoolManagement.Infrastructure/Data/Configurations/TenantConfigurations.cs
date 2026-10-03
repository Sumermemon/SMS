using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolManagement.Domain.Entities;
using SchoolManagement.Infrastructure.Identity;

namespace SchoolManagement.Infrastructure.Data.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);
        builder.Property(t => t.SlugCode).IsRequired().HasMaxLength(50);
        builder.Property(t => t.ContactEmail).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Phone).HasMaxLength(20);
        builder.Property(t => t.Address).HasMaxLength(500);
        builder.Property(t => t.LogoUrl).HasMaxLength(500);
        builder.HasIndex(t => t.SlugCode).IsUnique();
        builder.HasIndex(t => t.ContactEmail);
    }
}

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.DisplayName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Module).IsRequired().HasMaxLength(100);
        builder.HasIndex(p => p.Name).IsUnique();
    }
}

public class TenantPermissionConfiguration : IEntityTypeConfiguration<TenantPermission>
{
    public void Configure(EntityTypeBuilder<TenantPermission> builder)
    {
        builder.HasKey(tp => tp.Id);
        builder.Property(tp => tp.GrantedBy).HasMaxLength(450); // AspNetUsers Id length
        builder.HasOne(tp => tp.Tenant)
            .WithMany(t => t.TenantPermissions)
            .HasForeignKey(tp => tp.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(tp => tp.Permission)
            .WithMany(p => p.TenantPermissions)
            .HasForeignKey(tp => tp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(tp => new { tp.TenantId, tp.PermissionId }).IsUnique();
    }
}

public class AppRoleConfiguration : IEntityTypeConfiguration<AppRole>
{
    public void Configure(EntityTypeBuilder<AppRole> builder)
    {
        builder.Property(r => r.Description).HasMaxLength(500);
    }
}
