namespace Valid.OS.Application.Abstractions;

public interface IDateTimeProvider
{
    DateTimeOffset UtcNow { get; }
}
