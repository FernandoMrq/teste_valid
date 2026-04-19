using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.Primitives;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Domain.Entities;

public sealed class User : Entity
{
    private User()
    {
    }

    public Guid Id { get; private set; }

    public string KeycloakId { get; private set; } = null!;

    public Email Email { get; private set; } = null!;

    public string Name { get; private set; } = null!;

    public DateTimeOffset CreatedAt { get; private set; }

    public static User Create(string keycloakId, Email email, string name)
    {
        ValidateKeycloakId(keycloakId);
        ValidateName(name);

        return new User
        {
            Id = Guid.NewGuid(),
            KeycloakId = keycloakId.Trim(),
            Email = email,
            Name = name.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
        };
    }

    public void UpdateProfile(string name)
    {
        ValidateName(name);
        Name = name.Trim();
    }

    private static void ValidateKeycloakId(string keycloakId)
    {
        if (string.IsNullOrWhiteSpace(keycloakId))
        {
            throw new DomainException("Identificador Keycloak é obrigatório.");
        }
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Nome é obrigatório.");
        }
    }
}
