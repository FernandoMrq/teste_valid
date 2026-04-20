using Valid.OS.Application.Common;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Mappers;
using Valid.OS.Application.Services.Notifications.Queries;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.Application.Services.Notifications;

public sealed class NotificationAppService : INotificationAppService
{
    private readonly INotificationRepository _notifications;

    public NotificationAppService(INotificationRepository notifications)
    {
        _notifications = notifications;
    }

    public async Task<PagedResult<NotificationDto>> ListAsync(
        ListNotificationsQuery query,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(query);

        var (items, total) = await _notifications
            .ListAsync(query.Page, query.PageSize, cancellationToken)
            .ConfigureAwait(false);

        var dtos = items.Select(NotificationMapper.ToDto).ToList();
        return new PagedResult<NotificationDto>(dtos, total, query.Page, query.PageSize);
    }
}
