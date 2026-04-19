namespace Valid.OS.Domain.Entities;

public sealed class Notification
{
    public required string Id { get; init; }

    public required Guid ServiceOrderId { get; init; }

    public required Guid ClientId { get; init; }

    public required string Message { get; init; }

    public required string Channel { get; init; }

    public required DateTimeOffset ProcessedAt { get; init; }
}
