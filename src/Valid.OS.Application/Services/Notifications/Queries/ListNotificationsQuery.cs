namespace Valid.OS.Application.Services.Notifications.Queries;

public sealed record ListNotificationsQuery(int Page = 1, int PageSize = 20);
