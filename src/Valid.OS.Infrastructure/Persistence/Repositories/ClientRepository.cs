using Microsoft.EntityFrameworkCore;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.Infrastructure.Persistence.Repositories;

public sealed class ClientRepository(AppDbContext context) : IClientRepository
{
    public async Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Clients
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Clients.AnyAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Client>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await context.Clients
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }
}
