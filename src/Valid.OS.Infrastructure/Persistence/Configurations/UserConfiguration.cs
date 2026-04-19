using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .HasColumnName("id");

        builder.Property(u => u.KeycloakId)
            .HasColumnName("keycloak_id")
            .HasMaxLength(64)
            .IsRequired();

        builder.HasIndex(u => u.KeycloakId)
            .IsUnique();

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasConversion(e => e.Value, v => Email.Create(v))
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.Name)
            .HasColumnName("name")
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Ignore(u => u.DomainEvents);
    }
}
