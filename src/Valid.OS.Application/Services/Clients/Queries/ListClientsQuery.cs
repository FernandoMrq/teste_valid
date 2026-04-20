namespace Valid.OS.Application.Services.Clients.Queries;

public sealed record ListClientsQuery(int Page = 1, int PageSize = 20, string? Search = null);
