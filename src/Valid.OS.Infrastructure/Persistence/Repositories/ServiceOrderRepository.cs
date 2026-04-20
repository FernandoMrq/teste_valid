using Microsoft.EntityFrameworkCore;
using Valid.OS.Domain.Entities;
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
}
