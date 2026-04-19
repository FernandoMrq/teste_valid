namespace Valid.OS.Domain.Events;

public sealed record ServiceOrderClosedDomainEvent(
    Guid ServiceOrderId,
    Guid ClientId,
    string Description) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();

    public DateTimeOffset OccurredOn { get; } = DateTimeOffset.UtcNow;
}
