using Microsoft.EntityFrameworkCore;
using Valid.OS.Domain.Primitives;
using Valid.OS.Domain.Repositories;
using Valid.OS.Infrastructure.DomainEvents;

namespace Valid.OS.Infrastructure.Persistence;

public sealed class UnitOfWork(AppDbContext context, IDomainEventDispatcher domainEventDispatcher) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var aggregatesWithEvents = context.ChangeTracker
            .Entries<Entity>()
            .Where(e => e.Entity.DomainEvents.Count > 0)
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = aggregatesWithEvents
            .SelectMany(e => e.DomainEvents)
            .ToList();

        var rows = await context.SaveChangesAsync(cancellationToken);

        foreach (var entity in aggregatesWithEvents)
        {
            entity.ClearDomainEvents();
        }

        foreach (var domainEvent in domainEvents)
        {
            await domainEventDispatcher.DispatchAsync(domainEvent, cancellationToken);
        }

        return rows;
    }
}
