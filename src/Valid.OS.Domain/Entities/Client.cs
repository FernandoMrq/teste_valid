using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.Primitives;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Domain.Entities;

public sealed class Client : Entity
{
    private Client()
    {
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = null!;

    public Email Email { get; private set; } = null!;

    public Document? Document { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public static Client Create(string name, Email email, Document? document)
    {
        var trimmed = (name ?? string.Empty).Trim();

        if (trimmed.Length == 0)
        {
            throw new DomainException("Nome é obrigatório.");
        }

        if (trimmed.Length > 256)
        {
            throw new DomainException("Nome deve ter no máximo 256 caracteres.");
        }

        return new Client
        {
            Id = Guid.NewGuid(),
            Name = trimmed,
            Email = email,
            Document = document,
            CreatedAt = DateTimeOffset.UtcNow,
        };
    }
}
