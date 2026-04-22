using System.Text.RegularExpressions;
using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.Primitives;

namespace Valid.OS.Domain.ValueObjects;

public sealed class Email : ValueObject
{
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant,
        TimeSpan.FromMilliseconds(200));

    private Email(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static Email Create(string? input)
    {
        var normalized = input?.Trim() ?? string.Empty;
        normalized = normalized.ToLowerInvariant();

        if (normalized.Length == 0)
        {
            throw new DomainException("E-mail não pode ser vazio.");
        }

        if (!EmailRegex.IsMatch(normalized))
        {
            throw new DomainException("E-mail em formato inválido.");
        }

        return new Email(normalized);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
