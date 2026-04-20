using MassTransit;
using Microsoft.Extensions.Options;
using Serilog;
using Valid.OS.Infrastructure;
using Valid.OS.Infrastructure.Options;
using Valid.OS.Worker.Consumers;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSerilog(
    (_, loggerConfiguration) => loggerConfiguration.ReadFrom.Configuration(builder.Configuration));

builder.Services.AddInfrastructure(builder.Configuration, InfrastructureHostingProfile.Worker);

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<ServiceOrderClosedConsumer>();
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

        cfg.ReceiveEndpoint("service-order-closed", e =>
        {
            e.UseMessageRetry(r => r.Intervals(1000, 3000, 5000));
            e.ConfigureConsumer<ServiceOrderClosedConsumer>(context);
        });
    });
});

try
{
    var host = builder.Build();
    await host.RunAsync().ConfigureAwait(false);
}
finally
{
    await Log.CloseAndFlushAsync().ConfigureAwait(false);
}
