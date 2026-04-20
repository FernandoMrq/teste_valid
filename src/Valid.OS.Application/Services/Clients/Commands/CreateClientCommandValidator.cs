using FluentValidation;
using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Application.Services.Clients.Commands;

public sealed class CreateClientCommandValidator : AbstractValidator<CreateClientCommand>
{
    public CreateClientCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(256);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.DocumentValue)
            .Must(BeValidDocumentOrEmpty!)
            .When(x => !string.IsNullOrWhiteSpace(x.DocumentValue))
            .WithMessage("Documento deve ser um CPF ou CNPJ válido.");
    }

    private static bool BeValidDocumentOrEmpty(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        try
        {
            _ = Document.Create(value);
            return true;
        }
        catch (DomainException)
        {
            return false;
        }
    }
}
