using Valid.OS.Domain.Entities;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Application.Factories;

public sealed class UserFactory : IUserFactory
{
    public User CreateFromKeycloakClaims(string keycloakId, string email, string name)
    {
        var emailVo = Email.Create(email);
        return User.Create(keycloakId, emailVo, name);
    }
}
