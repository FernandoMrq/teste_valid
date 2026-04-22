using NSubstitute;
using Valid.OS.Application.Abstractions;
using Valid.OS.Application.Services.ServiceOrders;
using Valid.OS.Application.Services.ServiceOrders.Commands;
using Valid.OS.Domain;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.Application.Tests.Services;

public sealed class ServiceOrderAppServiceGetSummaryTests
{
    [Fact]
    public async Task GetSummaryAsync_maps_repository_totals()
    {
        var orders = Substitute.For<IServiceOrderRepository>();
        orders
            .GetSummaryAsync(Arg.Any<DateTimeOffset>(), Arg.Any<CancellationToken>())
            .Returns(new ServiceOrderSummary(5, 2, 1));

        var sut = new ServiceOrderAppService(
            orders,
            Substitute.For<IClientRepository>(),
            Substitute.For<IUnitOfWork>(),
            Substitute.For<ICurrentUserService>(),
            new CreateServiceOrderCommandValidator(),
            new UpdateServiceOrderCommandValidator(),
            new UpdateServiceOrderStatusCommandValidator());

        var dto = await sut.GetSummaryAsync();

        Assert.Equal(5, dto.OpenTotal);
        Assert.Equal(2, dto.CriticalOpenCount);
        Assert.Equal(1, dto.ClosedLast7Days);

        await orders.Received(1)
            .GetSummaryAsync(
                Arg.Is<DateTimeOffset>(d => d <= DateTimeOffset.UtcNow && d > DateTimeOffset.UtcNow.AddDays(-8)),
                Arg.Any<CancellationToken>());
    }
}
