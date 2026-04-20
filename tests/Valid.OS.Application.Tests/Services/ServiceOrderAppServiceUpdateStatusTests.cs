using FluentValidation;
using NSubstitute;
using Valid.OS.Application.Abstractions;
using Valid.OS.Application.Services.ServiceOrders;
using Valid.OS.Application.Services.ServiceOrders.Commands;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Events;
using Valid.OS.Domain.Repositories;
using Xunit;

namespace Valid.OS.Application.Tests.Services;

public sealed class ServiceOrderAppServiceUpdateStatusTests
{
    [Fact]
    public async Task UpdateStatusAsync_to_closed_calls_save_and_registers_closed_domain_event()
    {
        var clientId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var order = ServiceOrder.Create(clientId, "Chamado com descrição válida aqui.", Priority.Medium, userId);

        var orders = Substitute.For<IServiceOrderRepository>();
        var orderId = order.Id;
        orders.GetByIdForUpdateAsync(orderId, Arg.Any<CancellationToken>()).Returns(order);

        var uow = Substitute.For<IUnitOfWork>();
        uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);

        var sut = new ServiceOrderAppService(
            orders,
            Substitute.For<IClientRepository>(),
            uow,
            Substitute.For<ICurrentUserService>(),
            new CreateServiceOrderCommandValidator(),
            new UpdateServiceOrderCommandValidator(),
            new UpdateServiceOrderStatusCommandValidator());

        await sut.UpdateStatusAsync(new UpdateServiceOrderStatusCommand(orderId, ServiceOrderStatus.Closed));

        await uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());

        Assert.Equal(ServiceOrderStatus.Closed, order.Status);
        Assert.NotNull(order.ClosedAt);

        var closedEvents = order.DomainEvents.OfType<ServiceOrderClosedDomainEvent>().ToList();
        Assert.Single(closedEvents);
        Assert.Equal(orderId, closedEvents[0].ServiceOrderId);
        Assert.Equal(clientId, closedEvents[0].ClientId);
    }
}
