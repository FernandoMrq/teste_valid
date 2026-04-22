using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Valid.OS.API.IntegrationTests.Support;
using Valid.OS.Application.DTOs;

namespace Valid.OS.API.IntegrationTests.Users;

public sealed class UsersEndpointsTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() },
    };

    [Fact]
    public async Task GetMe_provisions_user_on_first_call_and_returns_same_on_second()
    {
        await using var factory = new ValidWebApplicationFactory();
        using var http = factory.CreateClient();

        var first = await http.GetAsync(new Uri("/api/users/me", UriKind.Relative));
        first.EnsureSuccessStatusCode();
        var u1 = await first.Content.ReadFromJsonAsync<UserDto>(JsonOptions);
        Assert.NotNull(u1);
        Assert.Equal(TestAuthDefaults.KeycloakSub, u1!.KeycloakId);
        Assert.Equal(TestAuthDefaults.Email, u1.Email);

        var second = await http.GetAsync(new Uri("/api/users/me", UriKind.Relative));
        second.EnsureSuccessStatusCode();
        var u2 = await second.Content.ReadFromJsonAsync<UserDto>(JsonOptions);
        Assert.Equal(u1.Id, u2!.Id);
    }
}
