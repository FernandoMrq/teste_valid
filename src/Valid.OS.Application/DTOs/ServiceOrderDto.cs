using Valid.OS.Domain.Enums;

namespace Valid.OS.Application.DTOs;

public sealed record ServiceOrderDto(
    Guid Id,
    Guid ClientId,
    string Description,
    Priority Priority,
    ServiceOrderStatus Status,
    Guid CreatedByUserId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? ClosedAt);
