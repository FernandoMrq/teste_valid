using Microsoft.EntityFrameworkCore;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.ValueObjects;
using Valid.OS.Infrastructure.Persistence;
using Valid.OS.Infrastructure.Persistence.Repositories;

namespace Valid.OS.Infrastructure.Tests.Persistence;

public sealed class UserRepositoryTests
{
    private static AppDbContext NewContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"infra-{Guid.NewGuid():N}")
            .Options);

    [Fact]
    public async Task Add_And_GetByKeycloakId_RoundTrips()
    {
        await using var ctx = NewContext();
        var repo = new UserRepository(ctx);

        var user = User.Create("kc-1", Email.Create("a@x.com"), "Jane");
        await repo.AddAsync(user);
        await ctx.SaveChangesAsync();

        var fetched = await repo.GetByKeycloakIdAsync("kc-1");
        Assert.NotNull(fetched);
        Assert.Equal(user.Id, fetched!.Id);
    }

    [Fact]
    public async Task GetByKeycloakId_ReturnsNull_WhenMissing()
    {
        await using var ctx = NewContext();
        var repo = new UserRepository(ctx);

        Assert.Null(await repo.GetByKeycloakIdAsync("nope"));
    }
}
