using Valid.OS.Application.DTOs;
using Valid.OS.Domain.Entities;

namespace Valid.OS.Application.Mappers;

public static class ServiceOrderMapper
{
    public static ServiceOrderDto ToDto(ServiceOrder order)
    {
        ArgumentNullException.ThrowIfNull(order);

        return new ServiceOrderDto(
            order.Id,
            order.ClientId,
            order.Description,
            order.Priority,
            order.Status,
            order.CreatedByUserId,
            order.CreatedAt,
            order.UpdatedAt,
            order.ClosedAt);
    }

    public static ServiceOrderDetailsDto ToDetailsDto(ServiceOrder order, Client client)
    {
        ArgumentNullException.ThrowIfNull(order);
        ArgumentNullException.ThrowIfNull(client);

        return new ServiceOrderDetailsDto(
            order.Id,
            order.ClientId,
            ClientMapper.ToDto(client),
            order.Description,
            order.Priority,
            order.Status,
            order.CreatedByUserId,
            order.CreatedAt,
            order.UpdatedAt,
            order.ClosedAt);
    }
}
