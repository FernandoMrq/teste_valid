using Microsoft.EntityFrameworkCore;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Specifications;
using Valid.OS.Infrastructure.Persistence;
using Valid.OS.Infrastructure.Persistence.Repositories;

namespace Valid.OS.Infrastructure.Tests.Persistence;

public sealed class ServiceOrderRepositoryTests
{
    private static AppDbContext NewContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"so-{Guid.NewGuid():N}")
            .Options);

    private static ServiceOrder NewOrder(
        Guid? clientId = null,
        Priority priority = Priority.Medium,
        ServiceOrderStatus status = ServiceOrderStatus.Open)
    {
        var order = ServiceOrder.Create(
            clientId ?? Guid.NewGuid(),
            "Descrição válida com mais de 10",
            priority,
            Guid.NewGuid());
        if (status != ServiceOrderStatus.Open)
        {
            order.ChangeStatus(status);
        }
        return order;
    }

    [Fact]
    public async Task Add_And_GetById_RoundTrips()
    {
        await using var ctx = NewContext();
        var repo = new ServiceOrderRepository(ctx);
        var order = NewOrder();

        await repo.AddAsync(order);
        await ctx.SaveChangesAsync();

        var fetched = await repo.GetByIdAsync(order.Id);
        Assert.NotNull(fetched);
        Assert.Equal(order.Id, fetched!.Id);
    }

    [Fact]
    public async Task GetByIdForUpdate_ReturnsTracked()
    {
        await using var ctx = NewContext();
        var repo = new ServiceOrderRepository(ctx);
        var order = NewOrder();

        await repo.AddAsync(order);
        await ctx.SaveChangesAsync();
        ctx.ChangeTracker.Clear();

        var fetched = await repo.GetByIdForUpdateAsync(order.Id);
        Assert.NotNull(fetched);
        Assert.Equal(EntityState.Unchanged, ctx.Entry(fetched!).State);
    }

    private sealed class AcceptAllSpec : Specification<ServiceOrder>
    {
        public override System.Linq.Expressions.Expression<Func<ServiceOrder, bool>> ToExpression() => _ => true;
    }

    [Fact]
    public async Task GetByIdWithClient_IncludesClient()
    {
        await using var ctx = NewContext();
        var client = Client.Create("Acme", Valid.OS.Domain.ValueObjects.Email.Create("a@x.com"), null);
        ctx.Clients.Add(client);
        var order = ServiceOrder.Create(client.Id, "Descrição válida com mais de 10", Priority.Medium, Guid.NewGuid());
        ctx.ServiceOrders.Add(order);
        await ctx.SaveChangesAsync();

        var repo = new ServiceOrderRepository(ctx);
        var fetched = await repo.GetByIdWithClientAsync(order.Id);

        Assert.NotNull(fetched);
        Assert.NotNull(fetched!.Client);
        Assert.Equal(client.Id, fetched.Client!.Id);
    }

    [Fact]
    public async Task GetSummary_ComputesCounts()
    {
        await using var ctx = NewContext();
        var repo = new ServiceOrderRepository(ctx);

        await repo.AddAsync(NewOrder(priority: Priority.Critical));
        await repo.AddAsync(NewOrder(priority: Priority.Medium));
        var closed = NewOrder();
        closed.ChangeStatus(ServiceOrderStatus.Closed);
        await repo.AddAsync(closed);
        await ctx.SaveChangesAsync();

        var summary = await repo.GetSummaryAsync(DateTimeOffset.UtcNow.AddDays(-7));

        Assert.Equal(2, summary.OpenTotal);
        Assert.Equal(1, summary.CriticalOpenCount);
        Assert.Equal(1, summary.ClosedLast7Days);
    }
}
