using MassTransit;
using NSubstitute;
using Valid.OS.Contracts.IntegrationEvents;
using Valid.OS.Domain.Events;
using Valid.OS.Infrastructure.DomainEvents;

namespace Valid.OS.Infrastructure.Tests.DomainEvents;

public sealed class ServiceOrderClosedDomainEventHandlerTests
{
    [Fact]
    public async Task Publishes_integration_event_with_same_payload()
    {
        var publisher = Substitute.For<IPublishEndpoint>();
        var sut = new ServiceOrderClosedDomainEventHandler(publisher);

        var domainEvent = new ServiceOrderClosedDomainEvent(Guid.NewGuid(), Guid.NewGuid(), "desc");
        await sut.HandleAsync(domainEvent);

        await publisher.Received(1).Publish(
            Arg.Is<ServiceOrderClosedIntegrationEvent>(e =>
                e.ServiceOrderId == domainEvent.ServiceOrderId
                && e.ClientId == domainEvent.ClientId
                && e.Description == domainEvent.Description),
            Arg.Any<CancellationToken>());
    }
}
