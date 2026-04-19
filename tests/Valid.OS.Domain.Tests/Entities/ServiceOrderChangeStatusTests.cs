using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Events;
using Valid.OS.Domain.Exceptions;

namespace Valid.OS.Domain.Tests.Entities;

public sealed class ServiceOrderChangeStatusTests
{
    private static ServiceOrder CreateOpenOrder()
    {
        return ServiceOrder.Create(
            Guid.NewGuid(),
            "Descrição inicial com mais de dez caracteres.",
            Priority.Medium,
            Guid.NewGuid());
    }

    [Fact]
    public void ChangeStatus_ToClosed_AddsSingleServiceOrderClosedDomainEvent()
    {
        var order = CreateOpenOrder();

        order.ChangeStatus(ServiceOrderStatus.Closed);

        Assert.Single(order.DomainEvents);
        var evt = Assert.IsType<ServiceOrderClosedDomainEvent>(order.DomainEvents.Single());
        Assert.Equal(order.Id, evt.ServiceOrderId);
        Assert.Equal(order.ClientId, evt.ClientId);
        Assert.Equal(order.Description, evt.Description);
    }

    [Fact]
    public void ChangeStatus_FromClosedToOther_ThrowsDomainException()
    {
        var order = CreateOpenOrder();
        order.ChangeStatus(ServiceOrderStatus.Closed);

        var ex = Assert.Throws<DomainException>(() =>
            order.ChangeStatus(ServiceOrderStatus.Open));

        Assert.Contains("fechada", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ChangeStatus_SameStatus_IsIdempotentAndDoesNotEmitEvent()
    {
        var order = CreateOpenOrder();

        order.ChangeStatus(ServiceOrderStatus.Open);

        Assert.Empty(order.DomainEvents);
    }

    [Fact]
    public void ChangeStatus_ToClosed_SetsClosedAt()
    {
        var order = CreateOpenOrder();
        var before = DateTimeOffset.UtcNow;

        order.ChangeStatus(ServiceOrderStatus.Closed);

        var after = DateTimeOffset.UtcNow;

        Assert.NotNull(order.ClosedAt);
        Assert.InRange(order.ClosedAt.Value, before.AddSeconds(-1), after.AddSeconds(1));
    }
}
