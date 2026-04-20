using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Valid.OS.Application.Abstractions;
using Valid.OS.Domain.Repositories;
using Valid.OS.Infrastructure.Auth;
using Valid.OS.Infrastructure.DomainEvents;
using Valid.OS.Infrastructure.Mongo;
using Valid.OS.Infrastructure.Options;
using Valid.OS.Infrastructure.Persistence;
using Valid.OS.Infrastructure.Persistence.Repositories;

namespace Valid.OS.Infrastructure;

public enum InfrastructureHostingProfile
{
    /// <summary>ASP.NET Core API: persistence, messaging publisher, domain dispatch, HTTP auth.</summary>
    Api,

    /// <summary>Worker host: typed options, MongoDB notification log only.</summary>
    Worker,
}

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        InfrastructureHostingProfile profile = InfrastructureHostingProfile.Api)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.Configure<KeycloakOptions>(configuration.GetSection(KeycloakOptions.SectionName));
        services.Configure<MongoOptions>(configuration.GetSection(MongoOptions.SectionName));
        services.Configure<RabbitMqOptions>(configuration.GetSection(RabbitMqOptions.SectionName));

        if (profile == InfrastructureHostingProfile.Api)
        {
            var postgresConnection = configuration.GetConnectionString("Postgres")
                ?? throw new InvalidOperationException("Connection string 'Postgres' is not configured.");

            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(
                    postgresConnection,
                    npgsql => npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(2), null)));

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IClientRepository, ClientRepository>();
            services.AddScoped<IServiceOrderRepository, ServiceOrderRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

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

            RegisterDomainEventHandlers(services);

            services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
        }

        services.AddSingleton<MongoContext>();

        services.AddScoped<INotificationRepository, NotificationRepository>();

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
