using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Events;
using Valid.OS.Infrastructure.DomainEvents;
using Valid.OS.Infrastructure.Persistence;

namespace Valid.OS.Infrastructure.Tests.Persistence;

public sealed class UnitOfWorkTests
{
    private static AppDbContext NewContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"uow-{Guid.NewGuid():N}")
            .Options);

    [Fact]
    public async Task SaveChanges_DispatchesDomainEvents_AndClearsThem()
    {
        await using var ctx = NewContext();
        var dispatcher = Substitute.For<IDomainEventDispatcher>();
        var uow = new UnitOfWork(ctx, dispatcher);

        var order = ServiceOrder.Create(Guid.NewGuid(), "Descrição válida com mais de 10", Priority.Medium, Guid.NewGuid());
        order.ChangeStatus(ServiceOrderStatus.Closed);
        ctx.ServiceOrders.Add(order);

        await uow.SaveChangesAsync();

        await dispatcher.Received(1).DispatchAsync(Arg.Any<IDomainEvent>(), Arg.Any<CancellationToken>());
        Assert.Empty(order.DomainEvents);
    }

    [Fact]
    public async Task SaveChanges_WithoutEvents_DoesNotDispatch()
    {
        await using var ctx = NewContext();
        var dispatcher = Substitute.For<IDomainEventDispatcher>();
        var uow = new UnitOfWork(ctx, dispatcher);

        var order = ServiceOrder.Create(Guid.NewGuid(), "Descrição válida com mais de 10", Priority.Low, Guid.NewGuid());
        ctx.ServiceOrders.Add(order);

        await uow.SaveChangesAsync();

        await dispatcher.DidNotReceive().DispatchAsync(Arg.Any<IDomainEvent>(), Arg.Any<CancellationToken>());
    }
}
