using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Valid.OS.Infrastructure.DomainEvents;
using Valid.OS.Infrastructure.Options;

namespace Valid.OS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.Configure<KeycloakOptions>(configuration.GetSection(KeycloakOptions.SectionName));
        services.Configure<MongoOptions>(configuration.GetSection(MongoOptions.SectionName));
        services.Configure<RabbitMqOptions>(configuration.GetSection(RabbitMqOptions.SectionName));

        RegisterDomainEventHandlers(services);

        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

        return services;
    }

    private static void RegisterDomainEventHandlers(IServiceCollection services)
    {
        var handlerOpen = typeof(IDomainEventHandler<>);
        var handlerImpls = typeof(DependencyInjection).Assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .SelectMany(t => t.GetInterfaces()
                .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == handlerOpen)
                .Select(i => new { Interface = i, Implementation = t }));

        foreach (var h in handlerImpls)
        {
            services.AddScoped(h.Interface, h.Implementation);
        }
    }
}
