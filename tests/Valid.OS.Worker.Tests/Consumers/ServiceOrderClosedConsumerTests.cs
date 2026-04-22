using MassTransit;
using MassTransit.Testing;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Valid.OS.Contracts.IntegrationEvents;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;
using Valid.OS.Worker.Consumers;

namespace Valid.OS.Worker.Tests.Consumers;

public sealed class ServiceOrderClosedConsumerTests
{
    [Fact]
    public async Task Consume_persists_notification_when_event_received()
    {
        var notifications = Substitute.For<INotificationRepository>();

        await using var provider = new ServiceCollection()
            .AddSingleton(notifications)
            .AddMassTransitTestHarness(cfg =>
            {
                cfg.AddConsumer<ServiceOrderClosedConsumer>();
            })
            .BuildServiceProvider(true);

        var harness = provider.GetRequiredService<ITestHarness>();
        await harness.Start();

        try
        {
            var evt = new ServiceOrderClosedIntegrationEvent(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "descrição",
                DateTimeOffset.UtcNow);

            await harness.Bus.Publish(evt);

            var consumed = harness.GetConsumerHarness<ServiceOrderClosedConsumer>();
            Assert.True(await consumed.Consumed.Any<ServiceOrderClosedIntegrationEvent>());

            await notifications.Received(1).AddAsync(
                Arg.Is<Notification>(n =>
                    n.ServiceOrderId == evt.ServiceOrderId
                    && n.ClientId == evt.ClientId
                    && n.Channel == "log"),
                Arg.Any<CancellationToken>());
        }
        finally
        {
            await harness.Stop();
        }
    }
}
