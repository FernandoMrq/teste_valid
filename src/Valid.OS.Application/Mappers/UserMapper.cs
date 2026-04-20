using Valid.OS.Application.DTOs;
using Valid.OS.Domain.Entities;

namespace Valid.OS.Application.Mappers;

public static class UserMapper
{
    public static UserDto ToDto(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        return new UserDto(
            user.Id,
            user.KeycloakId,
            user.Email.Value,
            user.Name,
            user.CreatedAt);
    }
}
