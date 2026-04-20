using FluentValidation;
using Valid.OS.Application.Common;
using Valid.OS.Application.DTOs;
using Valid.OS.Application.Exceptions;
using Valid.OS.Application.Mappers;
using Valid.OS.Application.Services.Clients.Commands;
using Valid.OS.Application.Services.Clients.Queries;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Application.Services.Clients;

public sealed class ClientAppService : IClientAppService
{
    private readonly IClientRepository _clients;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<CreateClientCommand> _createValidator;

    public ClientAppService(
        IClientRepository clients,
        IUnitOfWork unitOfWork,
        IValidator<CreateClientCommand> createValidator)
    {
        _clients = clients;
        _unitOfWork = unitOfWork;
        _createValidator = createValidator;
    }

    public async Task<ClientDto> CreateAsync(CreateClientCommand command, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validation = await _createValidator.ValidateAsync(command, cancellationToken).ConfigureAwait(false);
        if (!validation.IsValid)
        {
            throw new AppValidationException(validation.Errors);
        }

        var email = Email.Create(command.Email);
        Document? document = null;
        if (!string.IsNullOrWhiteSpace(command.DocumentValue))
        {
            document = Document.Create(command.DocumentValue);
        }

        var client = Client.Create(command.Name, email, document);
        await _clients.AddAsync(client, cancellationToken).ConfigureAwait(false);
        await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        return ClientMapper.ToDto(client);
    }

    public async Task<ClientDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var client = await _clients.GetByIdAsync(id, cancellationToken).ConfigureAwait(false)
            ?? throw new NotFoundException($"Cliente {id} não encontrado.");

        return ClientMapper.ToDto(client);
    }

    public async Task<PagedResult<ClientDto>> ListAsync(
        ListClientsQuery query,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(query);

        var (items, total) = await _clients
            .ListAsync(query.Page, query.PageSize, query.Search, cancellationToken)
            .ConfigureAwait(false);

        var dtos = items.Select(ClientMapper.ToDto).ToList();
        return new PagedResult<ClientDto>(dtos, total, query.Page, query.PageSize);
    }
}
