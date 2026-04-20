using Valid.OS.Domain.Enums;

namespace Valid.OS.Application.Services.ServiceOrders.Commands;

public sealed record UpdateServiceOrderStatusCommand(Guid Id, ServiceOrderStatus Status);
