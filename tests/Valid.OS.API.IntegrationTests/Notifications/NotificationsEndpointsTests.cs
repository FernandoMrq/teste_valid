using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Valid.OS.API.IntegrationTests.Support;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.API.IntegrationTests.Notifications;

public sealed class NotificationsEndpointsTests
{
    [Fact]
    public async Task List_returns_paged_result_shape()
    {
        var repo = Substitute.For<INotificationRepository>();
        repo.ListAsync(1, 20, Arg.Any<CancellationToken>())
            .Returns(((IReadOnlyList<Notification>)Array.Empty<Notification>(), 0));

        await using var factory = new ValidWebApplicationFactory();
        using var http = factory
            .WithWebHostBuilder(b => b.ConfigureTestServices(s =>
            {
                var existing = s.Where(d => d.ServiceType == typeof(INotificationRepository)).ToList();
                foreach (var d in existing) s.Remove(d);
                s.AddScoped(_ => repo);
            }))
            .CreateClient();

        var response = await http.GetAsync(new Uri("/api/notifications?page=1&pageSize=20", UriKind.Relative));
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(0, json.GetProperty("total").GetInt32());
        Assert.Equal(0, json.GetProperty("items").GetArrayLength());
        Assert.Equal(1, json.GetProperty("page").GetInt32());
        Assert.Equal(20, json.GetProperty("pageSize").GetInt32());
    }
}
