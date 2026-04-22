using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Valid.OS.Application.Abstractions;
using Valid.OS.Infrastructure.Auth;

namespace Valid.OS.Infrastructure.Tests.Auth;

public sealed class CurrentUserServiceTests
{
    private static (CurrentUserService Sut, HttpContext Ctx) Build(ClaimsPrincipal? principal = null)
    {
        var ctx = new DefaultHttpContext();
        if (principal is not null) ctx.User = principal;
        var accessor = new HttpContextAccessor { HttpContext = ctx };
        return (new CurrentUserService(accessor), ctx);
    }

    private static ClaimsPrincipal Authenticated(params Claim[] claims) =>
        new(new ClaimsIdentity(claims, "Test"));

    [Fact]
    public void IsAuthenticated_False_WhenNoIdentity()
    {
        var (sut, _) = Build();
        Assert.False(sut.IsAuthenticated);
        Assert.Null(sut.LocalUserId);
    }

    [Fact]
    public void Throws_WhenAccessingClaimsWithoutAuth()
    {
        var (sut, _) = Build();
        Assert.Throws<UnauthorizedAccessException>(() => sut.KeycloakId);
    }

    [Fact]
    public void ReadsClaims_WhenAuthenticated()
    {
        var principal = Authenticated(
            new Claim(ClaimTypes.NameIdentifier, "kc-1"),
            new Claim(ClaimTypes.Email, "a@x.com"),
            new Claim("preferred_username", "Jane"));

        var (sut, _) = Build(principal);

        Assert.True(sut.IsAuthenticated);
        Assert.Equal("kc-1", sut.KeycloakId);
        Assert.Equal("a@x.com", sut.Email);
        Assert.Equal("Jane", sut.Name);
    }

    [Fact]
    public void FallsBackToSubClaim()
    {
        var principal = Authenticated(
            new Claim("sub", "kc-2"),
            new Claim("email", "b@x.com"));
        var (sut, _) = Build(principal);

        Assert.Equal("kc-2", sut.KeycloakId);
        Assert.Equal("b@x.com", sut.Email);
    }

    [Fact]
    public void LocalUserId_ReadsFromHttpContextItems()
    {
        var id = Guid.NewGuid();
        var principal = Authenticated(new Claim(ClaimTypes.NameIdentifier, "kc-1"));
        var (sut, ctx) = Build(principal);
        ctx.Items[CurrentUserContextKeys.LocalUserId] = id;

        Assert.Equal(id, sut.LocalUserId);
    }

    [Fact]
    public void LocalUserId_Null_WhenItemAbsent()
    {
        var principal = Authenticated(new Claim(ClaimTypes.NameIdentifier, "kc-1"));
        var (sut, _) = Build(principal);

        Assert.Null(sut.LocalUserId);
    }
}
