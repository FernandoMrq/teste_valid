using Valid.OS.Domain.Enums;

namespace Valid.OS.Application.Services.ServiceOrders.Commands;

public sealed record UpdateServiceOrderCommand(Guid Id, string Description, Priority Priority);
