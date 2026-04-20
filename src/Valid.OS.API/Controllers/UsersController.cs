using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Services.Users;

namespace Valid.OS.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public sealed class UsersController : ControllerBase
{
    private readonly IUserAppService _users;

    public UsersController(IUserAppService users)
    {
        _users = users;
    }

    /// <summary>Provisiona o usuário local no primeiro acesso e retorna o perfil.</summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDto>> GetMe(CancellationToken cancellationToken)
    {
        var user = await _users.ProvisionAsync(cancellationToken).ConfigureAwait(false);
        return Ok(user);
    }
}
