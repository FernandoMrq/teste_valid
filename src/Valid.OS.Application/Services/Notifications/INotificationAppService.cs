using Valid.OS.Application.Common;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Services.Notifications.Queries;

namespace Valid.OS.Application.Services.Notifications;

public interface INotificationAppService
{
    Task<PagedResult<NotificationDto>> ListAsync(
        ListNotificationsQuery query,
        CancellationToken cancellationToken = default);
}
