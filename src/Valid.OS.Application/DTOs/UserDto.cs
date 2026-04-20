namespace Valid.OS.Application.DTOs;

public sealed record UserDto(
    Guid Id,
    string KeycloakId,
    string Email,
    string Name,
    DateTimeOffset CreatedAt);
