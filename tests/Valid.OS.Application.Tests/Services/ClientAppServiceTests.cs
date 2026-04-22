using NSubstitute;
using Valid.OS.Application.Exceptions;
using Valid.OS.Application.Services.Clients;
using Valid.OS.Application.Services.Clients.Commands;
using Valid.OS.Application.Services.Clients.Queries;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Application.Tests.Services;

public sealed class ClientAppServiceTests
{
    private static ClientAppService CreateSut(
        IClientRepository? clients = null,
        IUnitOfWork? uow = null) =>
        new(
            clients ?? Substitute.For<IClientRepository>(),
            uow ?? Substitute.For<IUnitOfWork>(),
            new CreateClientCommandValidator());

    [Fact]
    public async Task CreateAsync_persists_and_returns_dto_when_valid()
    {
        var clients = Substitute.For<IClientRepository>();
        var uow = Substitute.For<IUnitOfWork>();
        var sut = CreateSut(clients, uow);

        var cmd = new CreateClientCommand("Acme Corp", "acme@example.com", "11144477735");
        var dto = await sut.CreateAsync(cmd);

        Assert.Equal("Acme Corp", dto.Name);
        Assert.Equal("acme@example.com", dto.Email);
        Assert.Equal(DocumentType.Cpf, dto.DocumentType);
        Assert.Equal("11144477735", dto.DocumentValue);

        await clients.Received(1).AddAsync(Arg.Any<Client>(), Arg.Any<CancellationToken>());
        await uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_without_document_works()
    {
        var sut = CreateSut();
        var dto = await sut.CreateAsync(new CreateClientCommand("Acme", "acme@example.com", null));

        Assert.Null(dto.DocumentType);
        Assert.Null(dto.DocumentValue);
    }

    [Fact]
    public async Task CreateAsync_throws_AppValidationException_when_invalid()
    {
        var sut = CreateSut();
        await Assert.ThrowsAsync<AppValidationException>(() =>
            sut.CreateAsync(new CreateClientCommand("A", "not-an-email", null)));
    }

    [Fact]
    public async Task CreateAsync_throws_AppValidationException_when_document_invalid()
    {
        var sut = CreateSut();
        await Assert.ThrowsAsync<AppValidationException>(() =>
            sut.CreateAsync(new CreateClientCommand("Acme", "acme@example.com", "12345678900")));
    }

    [Fact]
    public async Task CreateAsync_throws_ArgumentNullException_when_command_null()
    {
        var sut = CreateSut();
        await Assert.ThrowsAsync<ArgumentNullException>(() => sut.CreateAsync(null!));
    }

    [Fact]
    public async Task GetByIdAsync_returns_dto_when_found()
    {
        var client = Client.Create("Acme", Email.Create("acme@example.com"), null);
        var clients = Substitute.For<IClientRepository>();
        clients.GetByIdAsync(client.Id, Arg.Any<CancellationToken>()).Returns(client);

        var dto = await CreateSut(clients).GetByIdAsync(client.Id);
        Assert.Equal(client.Id, dto.Id);
    }

    [Fact]
    public async Task GetByIdAsync_throws_NotFound_when_missing()
    {
        var clients = Substitute.For<IClientRepository>();
        clients.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Client?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateSut(clients).GetByIdAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task ListAsync_returns_paged_result()
    {
        var c1 = Client.Create("A", Email.Create("a@x.com"), null);
        var c2 = Client.Create("B", Email.Create("b@x.com"), null);
        var clients = Substitute.For<IClientRepository>();
        clients
            .ListAsync(1, 20, null, Arg.Any<CancellationToken>())
            .Returns(((IReadOnlyList<Client>)new[] { c1, c2 }, 2));

        var result = await CreateSut(clients).ListAsync(new ListClientsQuery(1, 20, null));

        Assert.Equal(2, result.Total);
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(1, result.Page);
    }

    [Fact]
    public async Task ListAsync_throws_ArgumentNullException_when_query_null()
    {
        await Assert.ThrowsAsync<ArgumentNullException>(() => CreateSut().ListAsync(null!));
    }
}
