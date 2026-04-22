using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using NSubstitute;
using Valid.OS.API.Filters;
using Valid.OS.Application.Abstractions;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.API.IntegrationTests.Filters;

public sealed class CurrentUserEnricherFilterTests
{
    private static ActionExecutingContext CreateContext(HttpContext httpContext)
    {
        var actionContext = new ActionContext(
            httpContext,
            new RouteData(),
            new ActionDescriptor());

        return new ActionExecutingContext(
            actionContext,
            new List<IFilterMetadata>(),
            new Dictionary<string, object?>(),
            controller: new object());
    }

    private static ActionExecutionDelegate NextStub(Action? onCalled = null)
    {
        return () =>
        {
            onCalled?.Invoke();
            var ctx = new ActionContext(new DefaultHttpContext(), new RouteData(), new ActionDescriptor());
            var executed = new ActionExecutedContext(ctx, new List<IFilterMetadata>(), controller: new object());
            return Task.FromResult(executed);
        };
    }

    [Fact]
    public async Task Skips_when_user_is_not_authenticated()
    {
        var repo = Substitute.For<IUserRepository>();
        var filter = new CurrentUserEnricherFilter(repo);
        var httpContext = new DefaultHttpContext();
        var context = CreateContext(httpContext);

        var nextCalled = false;
        await filter.OnActionExecutionAsync(context, NextStub(() => nextCalled = true));

        Assert.True(nextCalled);
        Assert.False(httpContext.Items.ContainsKey(CurrentUserContextKeys.LocalUserId));
        await repo.DidNotReceive().GetByKeycloakIdAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Skips_when_keycloak_id_claim_is_missing()
    {
        var repo = Substitute.For<IUserRepository>();
        var filter = new CurrentUserEnricherFilter(repo);
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(new List<Claim>(), authenticationType: "Test")),
        };
        var context = CreateContext(httpContext);

        var nextCalled = false;
        await filter.OnActionExecutionAsync(context, NextStub(() => nextCalled = true));

        Assert.True(nextCalled);
        Assert.False(httpContext.Items.ContainsKey(CurrentUserContextKeys.LocalUserId));
        await repo.DidNotReceive().GetByKeycloakIdAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Does_not_set_item_when_user_not_found()
    {
        var repo = Substitute.For<IUserRepository>();
        repo.GetByKeycloakIdAsync("kc-123", Arg.Any<CancellationToken>()).Returns((User?)null);

        var filter = new CurrentUserEnricherFilter(repo);
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                new[] { new Claim("sub", "kc-123") },
                authenticationType: "Test")),
        };
        var context = CreateContext(httpContext);

        await filter.OnActionExecutionAsync(context, NextStub());

        Assert.False(httpContext.Items.ContainsKey(CurrentUserContextKeys.LocalUserId));
        await repo.Received(1).GetByKeycloakIdAsync("kc-123", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Sets_local_user_id_when_user_is_found()
    {
        var user = User.Create("kc-999", Email.Create("u@test.com"), "Tester");
        var repo = Substitute.For<IUserRepository>();
        repo.GetByKeycloakIdAsync("kc-999", Arg.Any<CancellationToken>()).Returns(user);

        var filter = new CurrentUserEnricherFilter(repo);
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                new[] { new Claim(ClaimTypes.NameIdentifier, "kc-999") },
                authenticationType: "Test")),
        };
        var context = CreateContext(httpContext);

        var nextCalled = false;
        await filter.OnActionExecutionAsync(context, NextStub(() => nextCalled = true));

        Assert.True(nextCalled);
        Assert.True(httpContext.Items.ContainsKey(CurrentUserContextKeys.LocalUserId));
        Assert.Equal(user.Id, httpContext.Items[CurrentUserContextKeys.LocalUserId]);
    }
}
