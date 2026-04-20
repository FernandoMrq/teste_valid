using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Valid.OS.API.IntegrationTests.Support;

/// <summary>Autenticação fictícia para testes de integração (substitui JWT do Keycloak).</summary>
public sealed class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Test";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim("sub", TestAuthDefaults.KeycloakSub),
            new Claim(ClaimTypes.NameIdentifier, TestAuthDefaults.KeycloakSub),
            new Claim(ClaimTypes.Email, TestAuthDefaults.Email),
            new Claim("email", TestAuthDefaults.Email),
            new Claim("preferred_username", TestAuthDefaults.Name),
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

/// <summary>Claims fixas alinhadas ao fluxo de provisionamento local.</summary>
public static class TestAuthDefaults
{
    public const string KeycloakSub = "integration-test-sub";

    public const string Email = "integration.test@valid.local";

    public const string Name = "integration-test-user";
}
