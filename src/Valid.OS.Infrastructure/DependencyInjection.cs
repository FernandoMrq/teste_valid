using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Valid.OS.Infrastructure.DomainEvents;

namespace Valid.OS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

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
