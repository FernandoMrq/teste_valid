using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Infrastructure.Persistence.Configurations;

public sealed class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.ToTable("clients");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnName("id");

        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(c => c.Email)
            .HasColumnName("email")
            .HasConversion(e => e.Value, v => Email.Create(v))
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.OwnsOne(
            c => c.Document,
            owned =>
            {
                owned.Property(d => d.Value)
                    .HasColumnName("document")
                    .HasMaxLength(14);

                owned.Property(d => d.Type)
                    .HasColumnName("document_type")
                    .HasConversion<int>();
            });

        builder.Navigation(c => c.Document)
            .IsRequired(false);

        builder.Ignore(c => c.DomainEvents);
    }
}
