using Valid.OS.Application.DTOs;
using Valid.OS.Domain.Entities;

namespace Valid.OS.Application.Mappers;

public static class NotificationMapper
{
    public static NotificationDto ToDto(Notification notification)
    {
        ArgumentNullException.ThrowIfNull(notification);

        return new NotificationDto(
            notification.Id,
            notification.ServiceOrderId,
            notification.ClientId,
            notification.Message,
            notification.Channel,
            notification.ProcessedAt);
    }
}
