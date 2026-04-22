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

    public bool SyncKeycloakClaims(User user, string email, string name)
    {
        ArgumentNullException.ThrowIfNull(user);

        var changed = false;

        if (!string.Equals(user.Name, name?.Trim(), StringComparison.Ordinal))
        {
            user.UpdateProfile(name!);
            changed = true;
        }

        var normalizedEmail = Email.Create(email);
        if (!user.Email.Equals(normalizedEmail))
        {
            // Email mudou no IdP; hoje o domínio não reemite um novo Email VO para usuários existentes.
            // Tratar como ponto de extensão: log/alerta ou futura operação de merge.
            changed = true;
        }

        return changed;
    }
}
