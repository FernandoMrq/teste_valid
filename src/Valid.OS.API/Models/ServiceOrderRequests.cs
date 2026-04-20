using Valid.OS.Domain.Enums;

namespace Valid.OS.API.Models;

public sealed record UpdateServiceOrderRequest(string Description, Priority Priority);

public sealed record UpdateServiceOrderStatusRequest(ServiceOrderStatus Status);
