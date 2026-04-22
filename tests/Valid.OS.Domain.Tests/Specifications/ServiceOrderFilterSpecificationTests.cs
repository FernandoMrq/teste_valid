using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Specifications;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Domain.Tests.Specifications;

public sealed class ServiceOrderFilterSpecificationTests
{
    private static ServiceOrder BuildOrder(
        Guid? clientId = null,
        Priority priority = Priority.Medium,
        ServiceOrderStatus status = ServiceOrderStatus.Open)
    {
        var order = ServiceOrder.Create(
            clientId ?? Guid.NewGuid(),
            "Descrição válida com mais de 10",
            priority,
            Guid.NewGuid());

        if (status != ServiceOrderStatus.Open)
        {
            order.ChangeStatus(status);
        }

        return order;
    }

    [Fact]
    public void NoFilters_MatchesAny()
    {
        var spec = new ServiceOrderFilterSpecification(null, null, null);
        Assert.True(spec.IsSatisfiedBy(BuildOrder()));
    }

    [Fact]
    public void StatusFilter_OnlyMatchesSameStatus()
    {
        var spec = new ServiceOrderFilterSpecification(ServiceOrderStatus.InProgress, null, null);

        Assert.True(spec.IsSatisfiedBy(BuildOrder(status: ServiceOrderStatus.InProgress)));
        Assert.False(spec.IsSatisfiedBy(BuildOrder(status: ServiceOrderStatus.Open)));
    }

    [Fact]
    public void PriorityFilter_OnlyMatchesSamePriority()
    {
        var spec = new ServiceOrderFilterSpecification(null, Priority.High, null);

        Assert.True(spec.IsSatisfiedBy(BuildOrder(priority: Priority.High)));
        Assert.False(spec.IsSatisfiedBy(BuildOrder(priority: Priority.Low)));
    }

    [Fact]
    public void ClientFilter_EmptyGuid_IsIgnored()
    {
        var spec = new ServiceOrderFilterSpecification(null, null, Guid.Empty);
        Assert.True(spec.IsSatisfiedBy(BuildOrder()));
    }

    [Fact]
    public void ClientFilter_Matches()
    {
        var clientId = Guid.NewGuid();
        var spec = new ServiceOrderFilterSpecification(null, null, clientId);

        Assert.True(spec.IsSatisfiedBy(BuildOrder(clientId: clientId)));
        Assert.False(spec.IsSatisfiedBy(BuildOrder(clientId: Guid.NewGuid())));
    }

    [Fact]
    public void AllFilters_Combined_AreAndLogic()
    {
        var clientId = Guid.NewGuid();
        var spec = new ServiceOrderFilterSpecification(
            ServiceOrderStatus.Open,
            Priority.Critical,
            clientId);

        Assert.True(spec.IsSatisfiedBy(BuildOrder(clientId: clientId, priority: Priority.Critical)));
        Assert.False(spec.IsSatisfiedBy(BuildOrder(clientId: clientId, priority: Priority.Low)));
        Assert.False(spec.IsSatisfiedBy(BuildOrder(clientId: Guid.NewGuid(), priority: Priority.Critical)));
    }
}
