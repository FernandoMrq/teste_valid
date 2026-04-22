using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Domain.Tests.Entities;

public sealed class UserTests
{
    private static Email ValidEmail() => Email.Create("user@example.com");

    [Fact]
    public void Create_WithValidData_TrimsValues()
    {
        var user = User.Create("  kc-123  ", ValidEmail(), "  Jane Doe ");

        Assert.Equal("kc-123", user.KeycloakId);
        Assert.Equal("Jane Doe", user.Name);
        Assert.Equal(ValidEmail(), user.Email);
        Assert.NotEqual(Guid.Empty, user.Id);
        Assert.True(user.CreatedAt <= DateTimeOffset.UtcNow);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyKeycloakId_Throws(string? keycloakId)
    {
        Assert.Throws<DomainException>(() => User.Create(keycloakId!, ValidEmail(), "Jane"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyName_Throws(string? name)
    {
        Assert.Throws<DomainException>(() => User.Create("kc-1", ValidEmail(), name!));
    }

    [Fact]
    public void UpdateProfile_WithValidName_Updates()
    {
        var user = User.Create("kc-1", ValidEmail(), "Jane");
        user.UpdateProfile("  John  ");

        Assert.Equal("John", user.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void UpdateProfile_WithEmptyName_Throws(string name)
    {
        var user = User.Create("kc-1", ValidEmail(), "Jane");
        Assert.Throws<DomainException>(() => user.UpdateProfile(name));
    }
}
