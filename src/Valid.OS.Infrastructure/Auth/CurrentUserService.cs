using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Valid.OS.Application.Abstractions;

namespace Valid.OS.Infrastructure.Auth;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public bool IsAuthenticated =>
        httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true;

    public string? KeycloakId
    {
        get
        {
            EnsureAuthenticated();
            var user = httpContextAccessor.HttpContext!.User;
            return user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("sub");
        }
    }

    public string? Email
    {
        get
        {
            EnsureAuthenticated();
            return httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.Email)
                ?? httpContextAccessor.HttpContext.User.FindFirstValue("email");
        }
    }

    public string? Name
    {
        get
        {
            EnsureAuthenticated();
            return httpContextAccessor.HttpContext!.User.FindFirstValue("preferred_username");
        }
    }

    public Guid? LocalUserId
    {
        get
        {
            if (!IsAuthenticated)
            {
                return null;
            }

            var httpContext = httpContextAccessor.HttpContext!;
            if (httpContext.Items.TryGetValue(CurrentUserContextKeys.LocalUserId, out var value) && value is Guid id)
            {
                return id;
            }

            return null;
        }
    }

    private void EnsureAuthenticated()
    {
        if (!IsAuthenticated)
        {
            throw new UnauthorizedAccessException("Esta operação requer um usuário autenticado.");
        }
    }
}
