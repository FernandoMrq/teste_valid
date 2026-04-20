using MassTransit;
using Valid.OS.Contracts.IntegrationEvents;
using Valid.OS.Domain.Events;

namespace Valid.OS.Infrastructure.DomainEvents;

public sealed class ServiceOrderClosedDomainEventHandler(IPublishEndpoint publishEndpoint)
    : IDomainEventHandler<ServiceOrderClosedDomainEvent>
{
    public Task HandleAsync(ServiceOrderClosedDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        var integrationEvent = new ServiceOrderClosedIntegrationEvent(
            domainEvent.ServiceOrderId,
            domainEvent.ClientId,
            domainEvent.Description,
            domainEvent.OccurredOn);

        return publishEndpoint.Publish(integrationEvent, cancellationToken);
    }
}
