using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valid.OS.Application.Common;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Services.Clients;
using Valid.OS.Application.Services.Clients.Commands;
using Valid.OS.Application.Services.Clients.Queries;

namespace Valid.OS.API.Controllers;

[ApiController]
[Route("api/clients")]
[Authorize]
public sealed class ClientsController : ControllerBase
{
    private readonly IClientAppService _clients;

    public ClientsController(IClientAppService clients)
    {
        _clients = clients;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ClientDto>> Create(
        [FromBody] CreateClientCommand command,
        CancellationToken cancellationToken)
    {
        var dto = await _clients.CreateAsync(command, cancellationToken).ConfigureAwait(false);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ClientDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ClientDto>>> List(
        [FromQuery] ListClientsQuery query,
        CancellationToken cancellationToken)
    {
        var page = await _clients.ListAsync(query, cancellationToken).ConfigureAwait(false);
        return Ok(page);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var dto = await _clients.GetByIdAsync(id, cancellationToken).ConfigureAwait(false);
        return Ok(dto);
    }
}
