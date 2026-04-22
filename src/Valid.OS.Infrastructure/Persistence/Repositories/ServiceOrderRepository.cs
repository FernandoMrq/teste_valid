using Microsoft.EntityFrameworkCore;
using Valid.OS.Domain;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Repositories;
using Valid.OS.Domain.Specifications;

namespace Valid.OS.Infrastructure.Persistence.Repositories;

public sealed class ServiceOrderRepository(AppDbContext context) : IServiceOrderRepository
{
    public async Task AddAsync(ServiceOrder serviceOrder, CancellationToken cancellationToken = default)
    {
        await context.ServiceOrders.AddAsync(serviceOrder, cancellationToken);
    }

    public async Task<ServiceOrder?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.ServiceOrders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<ServiceOrder?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.ServiceOrders
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<ServiceOrder?> GetByIdWithClientAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.ServiceOrders
            .AsNoTracking()
            .Include(o => o.Client)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<ServiceOrder> Items, int TotalCount)> ListAsync(
        Specification<ServiceOrder> specification,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var predicate = specification.ToExpression();
        var query = context.ServiceOrders
            .AsNoTracking()
            .Include(o => o.Client)
            .Where(predicate);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<ServiceOrderSummary> GetSummaryAsync(
        DateTimeOffset closedSince,
        CancellationToken cancellationToken = default)
    {
        var open = new[]
        {
            ServiceOrderStatus.Open,
            ServiceOrderStatus.InProgress,
            ServiceOrderStatus.AwaitingCustomer,
            ServiceOrderStatus.Resolved,
        };

        var openTotal = await context.ServiceOrders
            .AsNoTracking()
            .CountAsync(o => open.Contains(o.Status), cancellationToken)
            .ConfigureAwait(false);

        var criticalOpenCount = await context.ServiceOrders
            .AsNoTracking()
            .CountAsync(
                o => o.Priority == Priority.Critical && o.Status != ServiceOrderStatus.Closed,
                cancellationToken)
            .ConfigureAwait(false);

        var closedLast7Days = await context.ServiceOrders
            .AsNoTracking()
            .CountAsync(
                o => o.Status == ServiceOrderStatus.Closed
                    && o.ClosedAt != null
                    && o.ClosedAt >= closedSince,
                cancellationToken)
            .ConfigureAwait(false);

        return new ServiceOrderSummary(openTotal, criticalOpenCount, closedLast7Days);
    }
}
