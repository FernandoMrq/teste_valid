using Valid.OS.Application.DTOs;
using Valid.OS.Application.Exceptions;
using Valid.OS.Application.Factories;
using Valid.OS.Application.Mappers;
using Valid.OS.Application.Abstractions;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.Application.Services.Users;

public sealed class UserAppService : IUserAppService
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserFactory _userFactory;
    private readonly ICurrentUserService _currentUser;

    public UserAppService(
        IUserRepository users,
        IUnitOfWork unitOfWork,
        IUserFactory userFactory,
        ICurrentUserService currentUser)
    {
        _users = users;
        _unitOfWork = unitOfWork;
        _userFactory = userFactory;
        _currentUser = currentUser;
    }

    public async Task<UserDto> ProvisionAsync(CancellationToken cancellationToken = default)
    {
        var keycloakId = RequireKeycloakId();
        var email = RequireEmail();
        var name = RequireName();

        var existing = await _users.GetByKeycloakIdAsync(keycloakId, cancellationToken).ConfigureAwait(false);
        if (existing is not null)
        {
            if (_userFactory.SyncKeycloakClaims(existing, email, name))
            {
                await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            }

            return UserMapper.ToDto(existing);
        }

        var user = _userFactory.CreateFromKeycloakClaims(keycloakId, email, name);
        await _users.AddAsync(user, cancellationToken).ConfigureAwait(false);
        await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        return UserMapper.ToDto(user);
    }

    public async Task<UserDto> GetCurrentAsync(CancellationToken cancellationToken = default)
    {
        var keycloakId = RequireKeycloakId();

        var user = await _users.GetByKeycloakIdAsync(keycloakId, cancellationToken).ConfigureAwait(false)
            ?? throw new NotFoundException("Usuário ainda não provisionado.");

        return UserMapper.ToDto(user);
    }

    private string RequireKeycloakId()
    {
        return _currentUser.KeycloakId
            ?? throw new UnauthorizedAccessException("Identificador do usuário não disponível.");
    }

    private string RequireEmail()
    {
        return _currentUser.Email
            ?? throw new UnauthorizedAccessException("E-mail do usuário não disponível.");
    }

    private string RequireName()
    {
        return _currentUser.Name
            ?? throw new UnauthorizedAccessException("Nome do usuário não disponível.");
    }
}
