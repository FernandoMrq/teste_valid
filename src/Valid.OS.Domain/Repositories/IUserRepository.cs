using Valid.OS.Domain.Entities;

namespace Valid.OS.Domain.Repositories;

public interface IUserRepository
{
    Task<User?> GetByKeycloakIdAsync(string keycloakId, CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);
}
