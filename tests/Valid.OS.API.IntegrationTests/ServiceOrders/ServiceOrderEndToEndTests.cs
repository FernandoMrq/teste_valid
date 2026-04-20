using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Valid.OS.API.IntegrationTests.Support;
using Valid.OS.Application.DTOs;
using Valid.OS.Domain.Enums;
using Xunit;

namespace Valid.OS.API.IntegrationTests.ServiceOrders;

public sealed class ServiceOrderEndToEndTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() },
    };

    [Fact]
    public async Task Service_order_flow_publishes_ServiceOrderClosedIntegrationEvent()
    {
        await using var factory = new ValidWebApplicationFactory();
        using var client = factory.CreateClient();

        await client.GetAsync(new Uri("/api/users/me", UriKind.Relative));

        var clientDto = await CreateClientAsync(client);

        var orderDto = await CreateServiceOrderAsync(client, clientDto.Id);

        var listUri = new Uri(
            $"/api/service-orders?status={ServiceOrderStatus.Open}&page=1&pageSize=20",
            UriKind.Relative);
        var listResponse = await client.GetAsync(listUri);
        listResponse.EnsureSuccessStatusCode();
        var listJson = await listResponse.Content.ReadFromJsonAsync<JsonElement>();
        var ids = listJson!.GetProperty("items").EnumerateArray().Select(e => e.GetProperty("id").GetGuid()).ToList();
        Assert.Contains(orderDto.Id, ids);

        var patchBody = JsonContent.Create(new { status = ServiceOrderStatus.Closed }, options: JsonOptions);
        var patchResponse = await client
            .PatchAsync(new Uri($"/api/service-orders/{orderDto.Id}/status", UriKind.Relative), patchBody);
        Assert.Equal(HttpStatusCode.NoContent, patchResponse.StatusCode);

        Assert.Contains(
            factory.PublishedIntegrationEvents,
            e => e.ServiceOrderId == orderDto.Id && e.ClientId == clientDto.Id);
    }

    private static async Task<ClientDto> CreateClientAsync(HttpClient client)
    {
        var body = JsonContent.Create(
            new { name = "Cliente integração", email = "cliente.integracao@valid.local", documentValue = (string?)null },
            options: JsonOptions);

        var response = await client.PostAsync(new Uri("/api/clients", UriKind.Relative), body);
        response.EnsureSuccessStatusCode();
        var dto = await response.Content.ReadFromJsonAsync<ClientDto>(JsonOptions);
        Assert.NotNull(dto);
        return dto!;
    }

    private static async Task<ServiceOrderDto> CreateServiceOrderAsync(HttpClient client, Guid clientId)
    {
        var body = JsonContent.Create(
            new
            {
                clientId,
                description = "Chamado de integração com texto suficiente.",
                priority = Priority.Medium,
            },
            options: JsonOptions);

        var response = await client
            .PostAsync(new Uri("/api/service-orders", UriKind.Relative), body);
        response.EnsureSuccessStatusCode();
        var dto = await response.Content.ReadFromJsonAsync<ServiceOrderDto>(JsonOptions);
        Assert.NotNull(dto);
        return dto!;
    }
}
