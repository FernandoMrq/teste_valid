using Valid.OS.Application.DTOs;
using Valid.OS.Application.Services.ServiceOrders.Commands;

namespace Valid.OS.Application.Services.ServiceOrders;

public interface IServiceOrderAppService
{
    Task<ServiceOrderDto> CreateAsync(CreateServiceOrderCommand command, CancellationToken cancellationToken = default);

    Task UpdateAsync(UpdateServiceOrderCommand command, CancellationToken cancellationToken = default);

    Task UpdateStatusAsync(UpdateServiceOrderStatusCommand command, CancellationToken cancellationToken = default);
}
