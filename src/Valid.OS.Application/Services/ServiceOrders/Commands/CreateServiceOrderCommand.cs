using Valid.OS.Domain.Enums;

namespace Valid.OS.Application.Services.ServiceOrders.Commands;

public sealed record CreateServiceOrderCommand(Guid ClientId, string Description, Priority Priority);
