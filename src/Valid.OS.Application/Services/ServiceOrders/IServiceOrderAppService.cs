using Valid.OS.Application.Common;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Services.ServiceOrders.Commands;
using Valid.OS.Application.Services.ServiceOrders.Queries;

namespace Valid.OS.Application.Services.ServiceOrders;

public interface IServiceOrderAppService
{
    Task<ServiceOrderDto> CreateAsync(CreateServiceOrderCommand command, CancellationToken cancellationToken = default);

    Task UpdateAsync(UpdateServiceOrderCommand command, CancellationToken cancellationToken = default);

    Task UpdateStatusAsync(UpdateServiceOrderStatusCommand command, CancellationToken cancellationToken = default);

    Task<ServiceOrderDetailsDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PagedResult<ServiceOrderDto>> ListAsync(
        ListServiceOrdersQuery query,
        CancellationToken cancellationToken = default);

    Task<ServiceOrderSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
}
