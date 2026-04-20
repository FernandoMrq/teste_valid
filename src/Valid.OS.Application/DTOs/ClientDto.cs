using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Application.DTOs;

public sealed record ClientDto(
    Guid Id,
    string Name,
    string Email,
    DocumentType? DocumentType,
    string? DocumentValue,
    DateTimeOffset CreatedAt);
