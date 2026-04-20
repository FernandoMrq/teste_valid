using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Valid.OS.Application.Factories;
using Valid.OS.Application.Services.Clients;
using Valid.OS.Application.Services.Notifications;
using Valid.OS.Application.Services.ServiceOrders;
using Valid.OS.Application.Services.Users;

namespace Valid.OS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IUserFactory, UserFactory>();
        services.AddScoped<IUserAppService, UserAppService>();
        services.AddScoped<IClientAppService, ClientAppService>();
        services.AddScoped<IServiceOrderAppService, ServiceOrderAppService>();
        services.AddScoped<INotificationAppService, NotificationAppService>();

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
