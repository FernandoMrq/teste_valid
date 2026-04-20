using NSubstitute;
using Valid.OS.Application.Abstractions;
using Valid.OS.Application.Exceptions;
using Valid.OS.Application.Services.ServiceOrders;
using Valid.OS.Application.Services.ServiceOrders.Commands;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Repositories;
using Xunit;

namespace Valid.OS.Application.Tests.Services;

public sealed class ServiceOrderAppServiceCreateTests
{
    [Fact]
    public async Task CreateAsync_persists_and_returns_dto_when_valid()
    {
        var clientId = Guid.NewGuid();
        var localUserId = Guid.NewGuid();

        var orders = Substitute.For<IServiceOrderRepository>();
        var clients = Substitute.For<IClientRepository>();
        clients.ExistsAsync(clientId, Arg.Any<CancellationToken>()).Returns(true);

        var uow = Substitute.For<IUnitOfWork>();
        uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);

        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.LocalUserId.Returns(localUserId);

        var sut = CreateSut(orders, clients, uow, currentUser);

        const string description = "Descrição válida com mais de dez caracteres.";
        var cmd = new CreateServiceOrderCommand(clientId, description, Priority.Medium);
        var dto = await sut.CreateAsync(cmd);

        Assert.NotEqual(Guid.Empty, dto.Id);
        Assert.Equal(clientId, dto.ClientId);
        Assert.Equal(description, dto.Description);
        Assert.Equal(Priority.Medium, dto.Priority);
        Assert.Equal(ServiceOrderStatus.Open, dto.Status);
        Assert.Equal(localUserId, dto.CreatedByUserId);

        await orders.Received(1).AddAsync(Arg.Any<ServiceOrder>(), Arg.Any<CancellationToken>());
        await uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_throws_NotFoundException_when_client_does_not_exist()
    {
        var clientId = Guid.NewGuid();
        var clients = Substitute.For<IClientRepository>();
        clients.ExistsAsync(clientId, Arg.Any<CancellationToken>()).Returns(false);

        var sut = CreateSut(
            Substitute.For<IServiceOrderRepository>(),
            clients,
            Substitute.For<IUnitOfWork>(),
            CreateProvisionedCurrentUser());

        var cmd = new CreateServiceOrderCommand(clientId, "Descrição válida com mais de dez caracteres.", Priority.Low);
        var ex = await Assert.ThrowsAsync<NotFoundException>(() => sut.CreateAsync(cmd));
        Assert.Contains(clientId.ToString(), ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CreateAsync_throws_AppValidationException_when_validator_fails()
    {
        var sut = CreateSut(
            Substitute.For<IServiceOrderRepository>(),
            Substitute.For<IClientRepository>(),
            Substitute.For<IUnitOfWork>(),
            CreateProvisionedCurrentUser());

        var cmd = new CreateServiceOrderCommand(Guid.NewGuid(), "curta", Priority.Low);
        var ex = await Assert.ThrowsAsync<AppValidationException>(() => sut.CreateAsync(cmd));
        Assert.Contains(ex.Failures, f => f.PropertyName == nameof(CreateServiceOrderCommand.Description));
    }

    [Fact]
    public async Task CreateAsync_throws_UnauthorizedAccessException_when_local_user_not_resolved()
    {
        var clientId = Guid.NewGuid();
        var clients = Substitute.For<IClientRepository>();
        clients.ExistsAsync(clientId, Arg.Any<CancellationToken>()).Returns(true);

        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.LocalUserId.Returns((Guid?)null);

        var sut = CreateSut(
            Substitute.For<IServiceOrderRepository>(),
            clients,
            Substitute.For<IUnitOfWork>(),
            currentUser);

        var cmd = new CreateServiceOrderCommand(clientId, "Descrição válida com mais de dez caracteres.", Priority.High);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => sut.CreateAsync(cmd));
    }

    private static ICurrentUserService CreateProvisionedCurrentUser()
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.LocalUserId.Returns(Guid.NewGuid());
        return currentUser;
    }

    private static ServiceOrderAppService CreateSut(
        IServiceOrderRepository orders,
        IClientRepository clients,
        IUnitOfWork uow,
        ICurrentUserService currentUser) =>
        new(
            orders,
            clients,
            uow,
            currentUser,
            new CreateServiceOrderCommandValidator(),
            new UpdateServiceOrderCommandValidator(),
            new UpdateServiceOrderStatusCommandValidator());
}
