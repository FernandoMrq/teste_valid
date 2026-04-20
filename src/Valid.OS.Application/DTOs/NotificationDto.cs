namespace Valid.OS.Application.DTOs;

public sealed record NotificationDto(
    string Id,
    Guid ServiceOrderId,
    Guid ClientId,
    string Message,
    string Channel,
    DateTimeOffset ProcessedAt);
