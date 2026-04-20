using MassTransit;
using Valid.OS.Contracts.IntegrationEvents;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.Worker.Consumers;

public sealed class ServiceOrderClosedConsumer(
    INotificationRepository notifications,
    ILogger<ServiceOrderClosedConsumer> logger) : IConsumer<ServiceOrderClosedIntegrationEvent>
{
    public async Task Consume(ConsumeContext<ServiceOrderClosedIntegrationEvent> context)
    {
        var message = context.Message;

        logger.LogInformation(
            "Service order closed. ServiceOrderId={ServiceOrderId} ClientId={ClientId} ClosedAt={ClosedAt}",
            message.ServiceOrderId,
            message.ClientId,
            message.ClosedAt);

        var notification = new Notification
        {
            Id = string.Empty,
            ServiceOrderId = message.ServiceOrderId,
            ClientId = message.ClientId,
            Message = $"Chamado {message.ServiceOrderId} finalizado.",
            Channel = "log",
            ProcessedAt = DateTimeOffset.UtcNow,
        };

        await notifications.AddAsync(notification, context.CancellationToken).ConfigureAwait(false);
    }
}
