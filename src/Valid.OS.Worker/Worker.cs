namespace Valid.OS.Worker;

/// <summary>
/// Placeholder até o MassTransit ser registrado; mantém o host genérico em execução.
/// </summary>
public sealed class Worker(ILogger<Worker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Valid.OS.Worker aguardando configuração de MassTransit.");
        try
        {
            await Task.Delay(Timeout.Infinite, stoppingToken).ConfigureAwait(false);
        }
        catch (OperationCanceledException)
        {
            // shutdown
        }
    }
}
