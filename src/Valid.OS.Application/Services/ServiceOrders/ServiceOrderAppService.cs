using FluentValidation;
using Valid.OS.Application.Abstractions;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Exceptions;
using Valid.OS.Application.Mappers;
using Valid.OS.Application.Services.ServiceOrders.Commands;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.Application.Services.ServiceOrders;

public sealed class ServiceOrderAppService : IServiceOrderAppService
{
    private readonly IServiceOrderRepository _orders;
    private readonly IClientRepository _clients;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IValidator<CreateServiceOrderCommand> _createValidator;
    private readonly IValidator<UpdateServiceOrderCommand> _updateValidator;
    private readonly IValidator<UpdateServiceOrderStatusCommand> _statusValidator;

    public ServiceOrderAppService(
        IServiceOrderRepository orders,
        IClientRepository clients,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IValidator<CreateServiceOrderCommand> createValidator,
        IValidator<UpdateServiceOrderCommand> updateValidator,
        IValidator<UpdateServiceOrderStatusCommand> statusValidator)
    {
        _orders = orders;
        _clients = clients;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _statusValidator = statusValidator;
    }

    public async Task<ServiceOrderDto> CreateAsync(
        CreateServiceOrderCommand command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validation = await _createValidator.ValidateAsync(command, cancellationToken).ConfigureAwait(false);
        if (!validation.IsValid)
        {
            throw new AppValidationException(validation.Errors);
        }

        if (!await _clients.ExistsAsync(command.ClientId, cancellationToken).ConfigureAwait(false))
        {
            throw new NotFoundException($"Cliente {command.ClientId} não encontrado.");
        }

        var localUserId = _currentUser.LocalUserId
            ?? throw new UnauthorizedAccessException(
                "Usuário não provisionado. Chame GET /api/users/me antes.");

        var order = ServiceOrder.Create(command.ClientId, command.Description, command.Priority, localUserId);
        await _orders.AddAsync(order, cancellationToken).ConfigureAwait(false);
        await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        return ServiceOrderMapper.ToDto(order);
    }

    public async Task UpdateAsync(UpdateServiceOrderCommand command, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validation = await _updateValidator.ValidateAsync(command, cancellationToken).ConfigureAwait(false);
        if (!validation.IsValid)
        {
            throw new AppValidationException(validation.Errors);
        }

        var order = await FindForUpdateOrThrowAsync(command.Id, cancellationToken).ConfigureAwait(false);
        order.ChangeDescription(command.Description);
        order.ChangePriority(command.Priority);

        await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task UpdateStatusAsync(
        UpdateServiceOrderStatusCommand command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validation = await _statusValidator.ValidateAsync(command, cancellationToken).ConfigureAwait(false);
        if (!validation.IsValid)
        {
            throw new AppValidationException(validation.Errors);
        }

        var order = await FindForUpdateOrThrowAsync(command.Id, cancellationToken).ConfigureAwait(false);
        order.ChangeStatus(command.Status);

        await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    private async Task<ServiceOrder> FindForUpdateOrThrowAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _orders.GetByIdForUpdateAsync(id, cancellationToken).ConfigureAwait(false)
            ?? throw new NotFoundException($"Chamado {id} não encontrado.");
    }
}
