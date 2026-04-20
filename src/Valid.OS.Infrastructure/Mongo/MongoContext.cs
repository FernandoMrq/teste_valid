using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Valid.OS.Infrastructure.Options;

namespace Valid.OS.Infrastructure.Mongo;

public sealed class MongoContext
{
    private readonly IMongoDatabase _database;
    private readonly SemaphoreSlim _notificationIndexGate = new(1, 1);
    private bool _notificationIndexesEnsured;

    public MongoContext(IOptions<MongoOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);
        var mongoOptions = options.Value;
        var client = new MongoClient(mongoOptions.ConnectionString);
        _database = client.GetDatabase(mongoOptions.DatabaseName);
    }

    public IMongoCollection<NotificationDocument> Notifications =>
        _database.GetCollection<NotificationDocument>("notifications");

    internal async Task EnsureNotificationIndexesAsync(CancellationToken cancellationToken)
    {
        if (_notificationIndexesEnsured)
        {
            return;
        }

        await _notificationIndexGate.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            if (_notificationIndexesEnsured)
            {
                return;
            }

            var collection = Notifications;
            var keys = Builders<NotificationDocument>.IndexKeys;
            await collection.Indexes.CreateOneAsync(
                new CreateIndexModel<NotificationDocument>(keys.Ascending(n => n.ServiceOrderId)),
                cancellationToken: cancellationToken).ConfigureAwait(false);
            await collection.Indexes.CreateOneAsync(
                new CreateIndexModel<NotificationDocument>(keys.Descending(n => n.ProcessedAt)),
                cancellationToken: cancellationToken).ConfigureAwait(false);
            _notificationIndexesEnsured = true;
        }
        finally
        {
            _notificationIndexGate.Release();
        }
    }
}
