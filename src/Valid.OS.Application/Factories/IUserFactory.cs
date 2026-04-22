using Valid.OS.Domain.Entities;

namespace Valid.OS.Application.Factories;

public interface IUserFactory
{
    User CreateFromKeycloakClaims(string keycloakId, string email, string name);

    bool SyncKeycloakClaims(User user, string email, string name);
}
