using Valid.OS.Domain.Entities;

namespace Valid.OS.Domain.Repositories;

public interface IClientRepository
{
    Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Client>> ListAsync(CancellationToken cancellationToken = default);
}
