using Serilog;
using Valid.OS.Infrastructure;
using Valid.OS.Worker;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSerilog(
    (_, loggerConfiguration) => loggerConfiguration.ReadFrom.Configuration(builder.Configuration));

builder.Services.AddInfrastructure(builder.Configuration, InfrastructureHostingProfile.Worker);
builder.Services.AddHostedService<Worker>();

try
{
    var host = builder.Build();
    await host.RunAsync().ConfigureAwait(false);
}
finally
{
    await Log.CloseAndFlushAsync().ConfigureAwait(false);
}
