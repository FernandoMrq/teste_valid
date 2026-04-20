using Valid.OS.Application.Common;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Services.Clients.Commands;
using Valid.OS.Application.Services.Clients.Queries;

namespace Valid.OS.Application.Services.Clients;

public interface IClientAppService
{
    Task<ClientDto> CreateAsync(CreateClientCommand command, CancellationToken cancellationToken = default);

    Task<ClientDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PagedResult<ClientDto>> ListAsync(ListClientsQuery query, CancellationToken cancellationToken = default);
}
