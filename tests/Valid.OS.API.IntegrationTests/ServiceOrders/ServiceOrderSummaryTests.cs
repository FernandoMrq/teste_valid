using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Valid.OS.API.IntegrationTests.Support;
using Valid.OS.Application.DTOs;
using Valid.OS.Domain.Enums;
using Xunit;

namespace Valid.OS.API.IntegrationTests.ServiceOrders;

public sealed class ServiceOrderSummaryTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() },
    };

    [Fact]
    public async Task Summary_returns_aggregated_counts()
    {
        await using var factory = new ValidWebApplicationFactory();
        using var client = factory.CreateClient();

        await client.GetAsync(new Uri("/api/users/me", UriKind.Relative));

        var clientDto = await CreateClientAsync(client);

        _ = await CreateServiceOrderAsync(
            client,
            clientDto.Id,
            "Primeira ordem de serviço com texto longo.",
            Priority.Medium);
        _ = await CreateServiceOrderAsync(
            client,
            clientDto.Id,
            "Segunda ordem crítica com texto longo.",
            Priority.Critical);
        var o3 = await CreateServiceOrderAsync(
            client,
            clientDto.Id,
            "Terceira ordem para in progress com texto.",
            Priority.Medium);
        var o4 = await CreateServiceOrderAsync(
            client,
            clientDto.Id,
            "Quarta ordem para fechar com texto longo.",
            Priority.Medium);

        var patchInProgress = JsonContent.Create(
            new { status = ServiceOrderStatus.InProgress },
            options: JsonOptions);
        var r3 = await client.PatchAsync(
            new Uri($"/api/service-orders/{o3.Id}/status", UriKind.Relative),
            patchInProgress);
        r3.EnsureSuccessStatusCode();

        var patchClosed = JsonContent.Create(
            new { status = ServiceOrderStatus.Closed },
            options: JsonOptions);
        var r4 = await client.PatchAsync(
            new Uri($"/api/service-orders/{o4.Id}/status", UriKind.Relative),
            patchClosed);
        r4.EnsureSuccessStatusCode();

        var summaryResponse = await client.GetAsync(
            new Uri("/api/service-orders/summary", UriKind.Relative));
        summaryResponse.EnsureSuccessStatusCode();
        var summary = await summaryResponse.Content.ReadFromJsonAsync<ServiceOrderSummaryDto>(JsonOptions);
        Assert.NotNull(summary);
        // o1 Open, o2 Open Critical, o3 InProgress = 3 abertas (não fechadas nos status "abertos")
        Assert.Equal(3, summary!.OpenTotal);
        Assert.Equal(1, summary.CriticalOpenCount);
        Assert.Equal(1, summary.ClosedLast7Days);
    }

    private static async Task<ClientDto> CreateClientAsync(HttpClient client)
    {
        var body = JsonContent.Create(
            new { name = "Cliente resumo", email = "resumo@valid.local", documentValue = (string?)null },
            options: JsonOptions);

        var response = await client.PostAsync(new Uri("/api/clients", UriKind.Relative), body);
        response.EnsureSuccessStatusCode();
        var dto = await response.Content.ReadFromJsonAsync<ClientDto>(JsonOptions);
        Assert.NotNull(dto);
        return dto!;
    }

    private static async Task<ServiceOrderDto> CreateServiceOrderAsync(
        HttpClient client,
        Guid clientId,
        string description,
        Priority priority)
    {
        var body = JsonContent.Create(
            new { clientId, description, priority },
            options: JsonOptions);

        var response = await client
            .PostAsync(new Uri("/api/service-orders", UriKind.Relative), body);
        response.EnsureSuccessStatusCode();
        var dto = await response.Content.ReadFromJsonAsync<ServiceOrderDto>(JsonOptions);
        Assert.NotNull(dto);
        return dto!;
    }
}
