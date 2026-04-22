using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Valid.OS.Domain.Events;

namespace Valid.OS.Infrastructure.DomainEvents;

public sealed class DomainEventDispatcher(
    IServiceProvider serviceProvider,
    ILogger<DomainEventDispatcher> logger) : IDomainEventDispatcher
{
    public async Task DispatchAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        var eventType = domainEvent.GetType();
        var handlerInterface = typeof(IDomainEventHandler<>).MakeGenericType(eventType);
        var handlers = serviceProvider.GetServices(handlerInterface);

        var handleAsync = handlerInterface.GetMethod(
            "HandleAsync",
            types: [eventType, typeof(CancellationToken)]);

        if (handleAsync is null)
        {
            return;
        }

        foreach (var handler in handlers)
        {
            if (handler is null)
            {
                continue;
            }

            try
            {
                var task = (Task)handleAsync.Invoke(handler, [domainEvent, cancellationToken])!;
                await task.ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                logger.LogError(
                    ex,
                    "Domain event handler {Handler} failed for event {Event}",
                    handler.GetType().Name,
                    eventType.Name);
                throw;
            }
        }
    }
}
