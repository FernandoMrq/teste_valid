using Valid.OS.Application.DTOs;

namespace Valid.OS.Application.Services.Users;

public interface IUserAppService
{
    Task<UserDto> ProvisionAsync(CancellationToken cancellationToken = default);

    Task<UserDto> GetCurrentAsync(CancellationToken cancellationToken = default);
}
