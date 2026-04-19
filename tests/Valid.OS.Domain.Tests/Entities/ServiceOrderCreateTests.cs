using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Exceptions;

namespace Valid.OS.Domain.Tests.Entities;

public sealed class ServiceOrderCreateTests
{
    [Fact]
    public void Create_EmptyClientId_ThrowsDomainException()
    {
        var ex = Assert.Throws<DomainException>(() =>
            ServiceOrder.Create(
                Guid.Empty,
                "Descrição com mais de dez caracteres.",
                Priority.Medium,
                Guid.NewGuid()));

        Assert.Contains("Cliente", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Create_EmptyCreatedByUserId_ThrowsDomainException()
    {
        var ex = Assert.Throws<DomainException>(() =>
            ServiceOrder.Create(
                Guid.NewGuid(),
                "Descrição com mais de dez caracteres.",
                Priority.Medium,
                Guid.Empty));

        Assert.Contains("Usuário", ex.Message, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("curta")]
    [InlineData("123456789")]
    public void Create_DescriptionTooShort_ThrowsDomainException(string description)
    {
        Assert.Throws<DomainException>(() =>
            ServiceOrder.Create(
                Guid.NewGuid(),
                description,
                Priority.Medium,
                Guid.NewGuid()));
    }

    [Fact]
    public void Create_Valid_ReturnsOpenWithMatchingTimestampsNearUtcNow()
    {
        var before = DateTimeOffset.UtcNow;
        var clientId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var order = ServiceOrder.Create(
            clientId,
            "Descrição válida com pelo menos dez caracteres.",
            Priority.High,
            userId);

        var after = DateTimeOffset.UtcNow;

        Assert.Equal(ServiceOrderStatus.Open, order.Status);
        Assert.Equal(clientId, order.ClientId);
        Assert.Equal(userId, order.CreatedByUserId);
        Assert.Equal(Priority.High, order.Priority);
        Assert.Null(order.ClosedAt);
        Assert.Equal(order.CreatedAt, order.UpdatedAt);
        Assert.InRange(order.CreatedAt, before.AddSeconds(-1), after.AddSeconds(1));
    }
}
