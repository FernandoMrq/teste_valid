using MongoDB.Bson;
using MongoDB.Driver;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;
using Valid.OS.Infrastructure.Mongo;

namespace Valid.OS.Infrastructure.Persistence.Repositories;

public sealed class NotificationRepository(MongoContext mongo) : INotificationRepository
{
    public async Task AddAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(notification);

        await mongo.EnsureNotificationIndexesAsync(cancellationToken).ConfigureAwait(false);
        var document = ToDocument(notification);
        await mongo.Notifications.InsertOneAsync(document, cancellationToken: cancellationToken).ConfigureAwait(false);
    }

    public async Task<(IReadOnlyList<Notification> Items, int TotalCount)> ListAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(pageSize, 1);

        await mongo.EnsureNotificationIndexesAsync(cancellationToken).ConfigureAwait(false);
        var collection = mongo.Notifications;
        var filter = Builders<NotificationDocument>.Filter.Empty;
        var total = await collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken).ConfigureAwait(false);
        var documents = await collection.Find(filter)
            .SortByDescending(d => d.ProcessedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken).ConfigureAwait(false);

        var items = documents.Select(FromDocument).ToList();
        return (items, (int)total);
    }

    private static NotificationDocument ToDocument(Notification notification)
    {
        var id = !string.IsNullOrWhiteSpace(notification.Id) && ObjectId.TryParse(notification.Id, out var parsed)
            ? parsed
            : ObjectId.GenerateNewId();

        return new NotificationDocument
        {
            Id = id,
            ServiceOrderId = notification.ServiceOrderId,
            ClientId = notification.ClientId,
            Message = notification.Message,
            Channel = notification.Channel,
            ProcessedAt = notification.ProcessedAt,
        };
    }

    private static Notification FromDocument(NotificationDocument document)
    {
        return new Notification
        {
            Id = document.Id.ToString(),
            ServiceOrderId = document.ServiceOrderId,
            ClientId = document.ClientId,
            Message = document.Message,
            Channel = document.Channel,
            ProcessedAt = document.ProcessedAt,
        };
    }
}
