using NSubstitute;
using Valid.OS.Application.Abstractions;
using Valid.OS.Application.Exceptions;
using Valid.OS.Application.Factories;
using Valid.OS.Application.Services.Users;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Application.Tests.Services;

public sealed class UserAppServiceTests
{
    private static (UserAppService Sut, IUserRepository Users, IUnitOfWork Uow, IUserFactory Factory, ICurrentUserService Current) Build(
        string? keycloakId = "kc-1",
        string? email = "user@example.com",
        string? name = "Jane")
    {
        var users = Substitute.For<IUserRepository>();
        var uow = Substitute.For<IUnitOfWork>();
        var factory = Substitute.For<IUserFactory>();
        var current = Substitute.For<ICurrentUserService>();
        current.KeycloakId.Returns(keycloakId);
        current.Email.Returns(email);
        current.Name.Returns(name);

        return (new UserAppService(users, uow, factory, current), users, uow, factory, current);
    }

    [Fact]
    public async Task ProvisionAsync_creates_user_when_not_existing()
    {
        var (sut, users, uow, factory, _) = Build();
        users.GetByKeycloakIdAsync("kc-1", Arg.Any<CancellationToken>()).Returns((User?)null);
        var created = User.Create("kc-1", Email.Create("user@example.com"), "Jane");
        factory.CreateFromKeycloakClaims("kc-1", "user@example.com", "Jane").Returns(created);

        var dto = await sut.ProvisionAsync();

        Assert.Equal(created.Id, dto.Id);
        await users.Received(1).AddAsync(created, Arg.Any<CancellationToken>());
        await uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProvisionAsync_syncs_existing_user_and_saves_when_changed()
    {
        var (sut, users, uow, factory, _) = Build();
        var existing = User.Create("kc-1", Email.Create("user@example.com"), "Jane");
        users.GetByKeycloakIdAsync("kc-1", Arg.Any<CancellationToken>()).Returns(existing);
        factory.SyncKeycloakClaims(existing, "user@example.com", "Jane").Returns(true);

        var dto = await sut.ProvisionAsync();

        Assert.Equal(existing.Id, dto.Id);
        await uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        await users.DidNotReceive().AddAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProvisionAsync_does_not_save_when_no_change()
    {
        var (sut, users, uow, factory, _) = Build();
        var existing = User.Create("kc-1", Email.Create("user@example.com"), "Jane");
        users.GetByKeycloakIdAsync("kc-1", Arg.Any<CancellationToken>()).Returns(existing);
        factory.SyncKeycloakClaims(existing, Arg.Any<string>(), Arg.Any<string>()).Returns(false);

        await sut.ProvisionAsync();

        await uow.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProvisionAsync_throws_when_keycloakId_missing()
    {
        var (sut, _, _, _, _) = Build(keycloakId: null);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => sut.ProvisionAsync());
    }

    [Fact]
    public async Task ProvisionAsync_throws_when_email_missing()
    {
        var (sut, _, _, _, _) = Build(email: null);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => sut.ProvisionAsync());
    }

    [Fact]
    public async Task ProvisionAsync_throws_when_name_missing()
    {
        var (sut, _, _, _, _) = Build(name: null);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => sut.ProvisionAsync());
    }

    [Fact]
    public async Task GetCurrentAsync_returns_user_when_found()
    {
        var (sut, users, _, _, _) = Build();
        var user = User.Create("kc-1", Email.Create("user@example.com"), "Jane");
        users.GetByKeycloakIdAsync("kc-1", Arg.Any<CancellationToken>()).Returns(user);

        var dto = await sut.GetCurrentAsync();
        Assert.Equal(user.Id, dto.Id);
    }

    [Fact]
    public async Task GetCurrentAsync_throws_NotFound_when_not_provisioned()
    {
        var (sut, users, _, _, _) = Build();
        users.GetByKeycloakIdAsync("kc-1", Arg.Any<CancellationToken>()).Returns((User?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.GetCurrentAsync());
    }
}
