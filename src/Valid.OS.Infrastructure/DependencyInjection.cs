using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Valid.OS.Domain.Repositories;
using Valid.OS.Infrastructure.DomainEvents;
using Valid.OS.Infrastructure.Mongo;
using Valid.OS.Infrastructure.Options;
using Valid.OS.Infrastructure.Persistence.Repositories;

namespace Valid.OS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.Configure<KeycloakOptions>(configuration.GetSection(KeycloakOptions.SectionName));
        services.Configure<MongoOptions>(configuration.GetSection(MongoOptions.SectionName));
        services.Configure<RabbitMqOptions>(configuration.GetSection(RabbitMqOptions.SectionName));

        services.AddMassTransit(x =>
        {
            x.SetKebabCaseEndpointNameFormatter();

            x.UsingRabbitMq((context, cfg) =>
            {
                var options = context.GetRequiredService<IOptions<RabbitMqOptions>>().Value;

                cfg.Host(
                    options.Host,
                    string.IsNullOrWhiteSpace(options.VHost) ? "/" : options.VHost,
                    h =>
                    {
                        h.Username(options.User);
                        h.Password(options.Password);
                    });
            });
        });

        services.AddSingleton<MongoContext>();

        services.AddScoped<INotificationRepository, NotificationRepository>();

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
