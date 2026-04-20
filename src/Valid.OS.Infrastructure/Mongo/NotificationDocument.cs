using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Valid.OS.Infrastructure.Mongo;

public sealed class NotificationDocument
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("serviceOrderId")]
    public Guid ServiceOrderId { get; set; }

    [BsonElement("clientId")]
    public Guid ClientId { get; set; }

    [BsonElement("message")]
    public string Message { get; set; } = string.Empty;

    [BsonElement("channel")]
    public string Channel { get; set; } = string.Empty;

    [BsonElement("processedAt")]
    public DateTimeOffset ProcessedAt { get; set; }
}
