using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valid.OS.Application.Common;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Services.ServiceOrders;
using Valid.OS.Application.Services.ServiceOrders.Commands;
using Valid.OS.Application.Services.ServiceOrders.Queries;
using Valid.OS.API.Models;

namespace Valid.OS.API.Controllers;

[ApiController]
[Route("api/service-orders")]
[Authorize]
public sealed class ServiceOrdersController : ControllerBase
{
    private readonly IServiceOrderAppService _orders;

    public ServiceOrdersController(IServiceOrderAppService orders)
    {
        _orders = orders;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ServiceOrderDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ServiceOrderDto>> Create(
        [FromBody] CreateServiceOrderCommand command,
        CancellationToken cancellationToken)
    {
        var dto = await _orders.CreateAsync(command, cancellationToken).ConfigureAwait(false);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ServiceOrderDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ServiceOrderDto>>> List(
        [FromQuery] ListServiceOrdersQuery query,
        CancellationToken cancellationToken)
    {
        var page = await _orders.ListAsync(query, cancellationToken).ConfigureAwait(false);
        return Ok(page);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ServiceOrderDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ServiceOrderDetailsDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var dto = await _orders.GetByIdAsync(id, cancellationToken).ConfigureAwait(false);
        return Ok(dto);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateServiceOrderRequest body,
        CancellationToken cancellationToken)
    {
        var command = new UpdateServiceOrderCommand(id, body.Description, body.Priority);
        await _orders.UpdateAsync(command, cancellationToken).ConfigureAwait(false);
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateServiceOrderStatusRequest body,
        CancellationToken cancellationToken)
    {
        var command = new UpdateServiceOrderStatusCommand(id, body.Status);
        await _orders.UpdateStatusAsync(command, cancellationToken).ConfigureAwait(false);
        return NoContent();
    }
}
