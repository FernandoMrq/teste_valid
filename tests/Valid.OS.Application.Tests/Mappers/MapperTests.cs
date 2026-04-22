using Valid.OS.Application.Mappers;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Enums;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Application.Tests.Mappers;

public sealed class MapperTests
{
    [Fact]
    public void ClientMapper_ToDto_MapsAllFields()
    {
        var doc = Document.Create("11144477735");
        var client = Client.Create("Acme", Email.Create("a@x.com"), doc);
        var dto = ClientMapper.ToDto(client);

        Assert.Equal(client.Id, dto.Id);
        Assert.Equal("Acme", dto.Name);
        Assert.Equal("a@x.com", dto.Email);
        Assert.Equal(DocumentType.Cpf, dto.DocumentType);
        Assert.Equal("11144477735", dto.DocumentValue);
        Assert.Equal(client.CreatedAt, dto.CreatedAt);
    }

    [Fact]
    public void ClientMapper_ToDto_MapsWithoutDocument()
    {
        var client = Client.Create("Acme", Email.Create("a@x.com"), null);
        var dto = ClientMapper.ToDto(client);

        Assert.Null(dto.DocumentType);
        Assert.Null(dto.DocumentValue);
    }

    [Fact]
    public void ClientMapper_ToDto_Throws_OnNull()
    {
        Assert.Throws<ArgumentNullException>(() => ClientMapper.ToDto(null!));
    }

    [Fact]
    public void UserMapper_ToDto_MapsAllFields()
    {
        var user = User.Create("kc-1", Email.Create("a@x.com"), "Jane");
        var dto = UserMapper.ToDto(user);

        Assert.Equal(user.Id, dto.Id);
        Assert.Equal("kc-1", dto.KeycloakId);
        Assert.Equal("a@x.com", dto.Email);
        Assert.Equal("Jane", dto.Name);
    }

    [Fact]
    public void UserMapper_ToDto_Throws_OnNull()
    {
        Assert.Throws<ArgumentNullException>(() => UserMapper.ToDto(null!));
    }

    [Fact]
    public void NotificationMapper_ToDto_MapsAllFields()
    {
        var now = DateTimeOffset.UtcNow;
        var notif = new Notification
        {
            Id = "n1",
            ServiceOrderId = Guid.NewGuid(),
            ClientId = Guid.NewGuid(),
            Message = "msg",
            Channel = "email",
            ProcessedAt = now,
        };
        var dto = NotificationMapper.ToDto(notif);

        Assert.Equal("n1", dto.Id);
        Assert.Equal(notif.ServiceOrderId, dto.ServiceOrderId);
        Assert.Equal(notif.ClientId, dto.ClientId);
        Assert.Equal("msg", dto.Message);
        Assert.Equal("email", dto.Channel);
        Assert.Equal(now, dto.ProcessedAt);
    }

    [Fact]
    public void NotificationMapper_ToDto_Throws_OnNull()
    {
        Assert.Throws<ArgumentNullException>(() => NotificationMapper.ToDto(null!));
    }

    [Fact]
    public void ServiceOrderMapper_ToDto_MapsAllFields()
    {
        var order = ServiceOrder.Create(Guid.NewGuid(), "Descrição válida com mais de 10", Priority.High, Guid.NewGuid());
        var dto = ServiceOrderMapper.ToDto(order);

        Assert.Equal(order.Id, dto.Id);
        Assert.Equal(order.ClientId, dto.ClientId);
        Assert.Equal(order.Description, dto.Description);
        Assert.Equal(Priority.High, dto.Priority);
        Assert.Equal(ServiceOrderStatus.Open, dto.Status);
    }

    [Fact]
    public void ServiceOrderMapper_ToDetailsDto_MergesClient()
    {
        var client = Client.Create("Acme", Email.Create("a@x.com"), null);
        var order = ServiceOrder.Create(client.Id, "Descrição válida com mais de 10", Priority.Low, Guid.NewGuid());
        var dto = ServiceOrderMapper.ToDetailsDto(order, client);

        Assert.Equal(order.Id, dto.Id);
        Assert.Equal(client.Id, dto.Client.Id);
    }

    [Fact]
    public void ServiceOrderMapper_Throws_OnNull()
    {
        Assert.Throws<ArgumentNullException>(() => ServiceOrderMapper.ToDto(null!));
        var client = Client.Create("a", Email.Create("a@x.com"), null);
        Assert.Throws<ArgumentNullException>(() => ServiceOrderMapper.ToDetailsDto(null!, client));
        var order = ServiceOrder.Create(Guid.NewGuid(), "Descrição válida com mais de 10", Priority.Low, Guid.NewGuid());
        Assert.Throws<ArgumentNullException>(() => ServiceOrderMapper.ToDetailsDto(order, null!));
    }
}
