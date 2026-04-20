using Valid.OS.Domain.Enums;

namespace Valid.OS.Application.Services.ServiceOrders.Queries;

public sealed record ListServiceOrdersQuery(
    ServiceOrderStatus? Status = null,
    Priority? Priority = null,
    Guid? ClientId = null,
    int Page = 1,
    int PageSize = 20);
