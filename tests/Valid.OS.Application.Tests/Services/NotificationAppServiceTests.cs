using NSubstitute;
using Valid.OS.Application.Services.Notifications;
using Valid.OS.Application.Services.Notifications.Queries;
using Valid.OS.Domain.Entities;
using Valid.OS.Domain.Repositories;

namespace Valid.OS.Application.Tests.Services;

public sealed class NotificationAppServiceTests
{
    [Fact]
    public async Task ListAsync_returns_paged_dtos()
    {
        var n = new Notification
        {
            Id = "n1",
            ServiceOrderId = Guid.NewGuid(),
            ClientId = Guid.NewGuid(),
            Message = "msg",
            Channel = "email",
            ProcessedAt = DateTimeOffset.UtcNow,
        };
        var notifs = Substitute.For<INotificationRepository>();
        notifs.ListAsync(1, 20, Arg.Any<CancellationToken>())
            .Returns(((IReadOnlyList<Notification>)new[] { n }, 1));

        var result = await new NotificationAppService(notifs).ListAsync(new ListNotificationsQuery(1, 20));

        Assert.Equal(1, result.Total);
        Assert.Single(result.Items);
        Assert.Equal("n1", result.Items[0].Id);
    }

    [Fact]
    public async Task ListAsync_throws_ArgumentNullException_when_query_null()
    {
        var sut = new NotificationAppService(Substitute.For<INotificationRepository>());
        await Assert.ThrowsAsync<ArgumentNullException>(() => sut.ListAsync(null!));
    }
}
