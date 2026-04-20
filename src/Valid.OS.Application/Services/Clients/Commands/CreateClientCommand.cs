namespace Valid.OS.Application.Services.Clients.Commands;

public sealed record CreateClientCommand(string Name, string Email, string? DocumentValue);
