using System.Linq.Expressions;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;

namespace Valid.OS.Domain.Specifications;

public sealed class ServiceOrderFilterSpecification : Specification<ServiceOrder>
{
    private readonly ServiceOrderStatus? _status;
    private readonly Priority? _priority;
    private readonly Guid? _clientId;

    public ServiceOrderFilterSpecification(
        ServiceOrderStatus? status,
        Priority? priority,
        Guid? clientId)
    {
        _status = status;
        _priority = priority;
        _clientId = clientId;
    }

    public override Expression<Func<ServiceOrder, bool>> ToExpression()
    {
        Expression<Func<ServiceOrder, bool>> predicate = _ => true;

        if (_status is { } status)
        {
            var capturedStatus = status;
            predicate = predicate.And(x => x.Status == capturedStatus);
        }

        if (_priority is { } priority)
        {
            var capturedPriority = priority;
            predicate = predicate.And(x => x.Priority == capturedPriority);
        }

        if (_clientId is { } clientId && clientId != Guid.Empty)
        {
            var capturedClientId = clientId;
            predicate = predicate.And(x => x.ClientId == capturedClientId);
        }

        return predicate;
    }
}
