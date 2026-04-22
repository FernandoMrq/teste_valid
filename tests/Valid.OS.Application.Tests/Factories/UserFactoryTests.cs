using Valid.OS.Application.Factories;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Application.Tests.Factories;

public sealed class UserFactoryTests
{
    private readonly UserFactory _sut = new();

    [Fact]
    public void CreateFromKeycloakClaims_ReturnsValidUser()
    {
        var user = _sut.CreateFromKeycloakClaims("kc-1", "user@example.com", "Jane");

        Assert.Equal("kc-1", user.KeycloakId);
        Assert.Equal("Jane", user.Name);
        Assert.Equal("user@example.com", user.Email.Value);
    }

    [Fact]
    public void SyncKeycloakClaims_Throws_OnNullUser()
    {
        Assert.Throws<ArgumentNullException>(() =>
            _sut.SyncKeycloakClaims(null!, "a@x.com", "Jane"));
    }

    [Fact]
    public void SyncKeycloakClaims_ReturnsFalse_WhenNothingChanged()
    {
        var user = User.Create("kc-1", Email.Create("user@example.com"), "Jane");

        var changed = _sut.SyncKeycloakClaims(user, "user@example.com", "Jane");

        Assert.False(changed);
    }

    [Fact]
    public void SyncKeycloakClaims_UpdatesName_WhenDifferent()
    {
        var user = User.Create("kc-1", Email.Create("user@example.com"), "Jane");

        var changed = _sut.SyncKeycloakClaims(user, "user@example.com", "John");

        Assert.True(changed);
        Assert.Equal("John", user.Name);
    }

    [Fact]
    public void SyncKeycloakClaims_ReturnsTrue_WhenEmailChanged()
    {
        var user = User.Create("kc-1", Email.Create("user@example.com"), "Jane");

        var changed = _sut.SyncKeycloakClaims(user, "other@example.com", "Jane");

        Assert.True(changed);
    }
}
