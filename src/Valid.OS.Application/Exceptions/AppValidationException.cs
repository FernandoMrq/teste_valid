using FluentValidation.Results;

namespace Valid.OS.Application.Exceptions;

public sealed class AppValidationException : Exception
{
    public AppValidationException(IEnumerable<ValidationFailure> failures)
        : base("Uma ou mais regras de validação falharam.")
    {
        Failures = failures.ToList().AsReadOnly();
    }

    public IReadOnlyList<ValidationFailure> Failures { get; }
}
