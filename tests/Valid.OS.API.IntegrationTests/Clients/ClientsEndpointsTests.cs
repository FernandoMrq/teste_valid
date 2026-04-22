using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Valid.OS.API.IntegrationTests.Support;
using Valid.OS.Application.DTOs;

namespace Valid.OS.API.IntegrationTests.Clients;

public sealed class ClientsEndpointsTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() },
    };

    [Fact]
    public async Task Post_creates_and_Get_retrieves_client()
    {
        await using var factory = new ValidWebApplicationFactory();
        using var http = factory.CreateClient();

        var body = JsonContent.Create(new { name = "Cli A", email = "a@x.com", documentValue = (string?)null }, options: JsonOptions);
        var post = await http.PostAsync(new Uri("/api/clients", UriKind.Relative), body);
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);

        var created = await post.Content.ReadFromJsonAsync<ClientDto>(JsonOptions);
        Assert.NotNull(created);

        var get = await http.GetAsync(new Uri($"/api/clients/{created!.Id}", UriKind.Relative));
        get.EnsureSuccessStatusCode();
        var dto = await get.Content.ReadFromJsonAsync<ClientDto>(JsonOptions);
        Assert.Equal(created.Id, dto!.Id);

        var list = await http.GetAsync(new Uri("/api/clients?page=1&pageSize=20", UriKind.Relative));
        list.EnsureSuccessStatusCode();
        var listJson = await list.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(listJson.GetProperty("total").GetInt32() >= 1);
    }

    [Fact]
    public async Task Post_returns_400_when_validation_fails()
    {
        await using var factory = new ValidWebApplicationFactory();
        using var http = factory.CreateClient();

        var body = JsonContent.Create(new { name = "A", email = "invalid", documentValue = (string?)null }, options: JsonOptions);
        var post = await http.PostAsync(new Uri("/api/clients", UriKind.Relative), body);

        Assert.Equal(HttpStatusCode.BadRequest, post.StatusCode);
    }

    [Fact]
    public async Task Get_returns_404_when_not_found()
    {
        await using var factory = new ValidWebApplicationFactory();
        using var http = factory.CreateClient();

        var get = await http.GetAsync(new Uri($"/api/clients/{Guid.NewGuid()}", UriKind.Relative));
        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
    }
}
