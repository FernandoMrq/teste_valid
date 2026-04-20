namespace Valid.OS.Contracts.IntegrationEvents;

public sealed record ServiceOrderClosedIntegrationEvent(
    Guid ServiceOrderId,
    Guid ClientId,
    string Description,
    DateTimeOffset ClosedAt);
