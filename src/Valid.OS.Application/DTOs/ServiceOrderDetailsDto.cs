using Valid.OS.Domain.Enums;

namespace Valid.OS.Application.DTOs;

public sealed record ServiceOrderDetailsDto(
    Guid Id,
    Guid ClientId,
    ClientDto Client,
    string Description,
    Priority Priority,
    ServiceOrderStatus Status,
    Guid CreatedByUserId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? ClosedAt);
