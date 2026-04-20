using System.Collections.Concurrent;
using MassTransit;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using RabbitMQ.Client;
using Valid.OS.API;
using Valid.OS.Contracts.IntegrationEvents;
using Valid.OS.Infrastructure.Persistence;

namespace Valid.OS.API.IntegrationTests.Support;

public sealed class ValidWebApplicationFactory : WebApplicationFactory<Program>
{
    /// <summary>Mensagens publicadas após substituir o bus Rabbit por um double de teste.</summary>
    public ConcurrentBag<ServiceOrderClosedIntegrationEvent> PublishedIntegrationEvents { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            var inMemoryDatabaseName = $"valid-os-it-{Guid.NewGuid():N}";

            RemoveDescriptors(services, d => d.ServiceType == typeof(IConnection));

            RemoveDescriptors(
                services,
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>) || d.ServiceType == typeof(AppDbContext));

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(inMemoryDatabaseName));

            RemoveMassTransit(services);

            var bag = PublishedIntegrationEvents;
            var publishEndpoint = Substitute.For<IPublishEndpoint>();
            publishEndpoint
                .Publish(Arg.Any<ServiceOrderClosedIntegrationEvent>(), Arg.Any<CancellationToken>())
                .Returns(Task.CompletedTask)
                .AndDoes(call => bag.Add(call.Arg<ServiceOrderClosedIntegrationEvent>()));

            services.AddScoped(_ => publishEndpoint);

            services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                    options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
        });
    }

    private static void RemoveDescriptors(IServiceCollection services, Func<ServiceDescriptor, bool> predicate)
    {
        foreach (var d in services.Where(predicate).ToList())
        {
            services.Remove(d);
        }
    }

    private static void RemoveMassTransit(IServiceCollection services)
    {
        foreach (var d in services.Where(IsMassTransitRegistration).ToList())
        {
            services.Remove(d);
        }
    }

    private static bool IsMassTransitRegistration(ServiceDescriptor d)
    {
        if (d.ServiceType.FullName?.StartsWith("MassTransit.", StringComparison.Ordinal) == true)
        {
            return true;
        }

        if (d.ImplementationType?.FullName?.StartsWith("MassTransit.", StringComparison.Ordinal) == true)
        {
            return true;
        }

        if (d.ServiceType == typeof(IHostedService) &&
            d.ImplementationType?.FullName?.Contains("MassTransit", StringComparison.Ordinal) == true)
        {
            return true;
        }

        return false;
    }
}
