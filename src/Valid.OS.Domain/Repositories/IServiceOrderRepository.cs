using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Specifications;

namespace Valid.OS.Domain.Repositories;

public interface IServiceOrderRepository
{
    Task AddAsync(ServiceOrder serviceOrder, CancellationToken cancellationToken = default);

    Task<ServiceOrder?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ServiceOrder?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ServiceOrder?> GetByIdWithClientAsync(Guid id, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<ServiceOrder> Items, int TotalCount)> ListAsync(
        Specification<ServiceOrder> specification,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
