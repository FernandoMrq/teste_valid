using Valid.OS.Application.DTOs;
using Valid.OS.Domain.Entities;

namespace Valid.OS.Application.Mappers;

public static class ClientMapper
{
    public static ClientDto ToDto(Client client)
    {
        ArgumentNullException.ThrowIfNull(client);

        return new ClientDto(
            client.Id,
            client.Name,
            client.Email.Value,
            client.Document?.Type,
            client.Document?.Value,
            client.CreatedAt);
    }
}
