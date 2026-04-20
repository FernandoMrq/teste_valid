using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valid.OS.Application.Common;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Services.Notifications;
using Valid.OS.Application.Services.Notifications.Queries;

namespace Valid.OS.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationAppService _notifications;

    public NotificationsController(INotificationAppService notifications)
    {
        _notifications = notifications;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<NotificationDto>>> List(
        [FromQuery] ListNotificationsQuery query,
        CancellationToken cancellationToken)
    {
        var page = await _notifications.ListAsync(query, cancellationToken).ConfigureAwait(false);
        return Ok(page);
    }
}
