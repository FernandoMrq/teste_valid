using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Filters;
using Valid.OS.Application.Abstractions;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.API.Filters;

public sealed class CurrentUserEnricherFilter(IUserRepository users) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var httpContext = context.HttpContext;
        if (httpContext.User.Identity?.IsAuthenticated != true)
        {
            await next().ConfigureAwait(false);
            return;
        }

        var keycloakId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? httpContext.User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(keycloakId))
        {
            await next().ConfigureAwait(false);
            return;
        }

        var user = await users.GetByKeycloakIdAsync(keycloakId, httpContext.RequestAborted).ConfigureAwait(false);
        if (user is not null)
        {
            httpContext.Items[CurrentUserContextKeys.LocalUserId] = user.Id;
        }

        await next().ConfigureAwait(false);
    }
}
