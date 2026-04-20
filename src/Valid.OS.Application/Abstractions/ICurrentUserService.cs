namespace Valid.OS.Application.Abstractions;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }

    string? KeycloakId { get; }

    string? Email { get; }

    string? Name { get; }

    Guid? LocalUserId { get; }
}
