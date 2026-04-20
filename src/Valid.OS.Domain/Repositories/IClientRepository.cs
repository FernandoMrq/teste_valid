using Valid.OS.Domain.Entities;

namespace Valid.OS.Domain.Repositories;

public interface IClientRepository
{
    Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Client client, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Client> Items, int TotalCount)> ListAsync(
        int page,
        int pageSize,
        string? search,
        CancellationToken cancellationToken = default);
}
