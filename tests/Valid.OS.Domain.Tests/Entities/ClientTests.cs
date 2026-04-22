using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Domain.Tests.Entities;

public sealed class ClientTests
{
    private static Email ValidEmail() => Email.Create("user@example.com");

    [Fact]
    public void Create_WithValidData_TrimsName()
    {
        var client = Client.Create("  Acme Corp  ", ValidEmail(), document: null);

        Assert.Equal("Acme Corp", client.Name);
        Assert.Equal(ValidEmail(), client.Email);
        Assert.Null(client.Document);
        Assert.NotEqual(Guid.Empty, client.Id);
        Assert.True(client.CreatedAt <= DateTimeOffset.UtcNow);
    }

    [Fact]
    public void Create_WithDocument_KeepsDocument()
    {
        var doc = Document.Create("11144477735");
        var client = Client.Create("Acme", ValidEmail(), doc);

        Assert.Equal(doc, client.Document);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyName_Throws(string? name)
    {
        Assert.Throws<DomainException>(() => Client.Create(name!, ValidEmail(), null));
    }

    [Fact]
    public void Create_WithNameTooLong_Throws()
    {
        var longName = new string('a', 257);
        Assert.Throws<DomainException>(() => Client.Create(longName, ValidEmail(), null));
    }

    [Fact]
    public void Create_WithNameAtMaxLength_Succeeds()
    {
        var name = new string('a', 256);
        var client = Client.Create(name, ValidEmail(), null);

        Assert.Equal(256, client.Name.Length);
    }
}
