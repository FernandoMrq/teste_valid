using FluentValidation;

namespace Valid.OS.Application.Services.ServiceOrders.Commands;

public sealed class CreateServiceOrderCommandValidator : AbstractValidator<CreateServiceOrderCommand>
{
    public CreateServiceOrderCommandValidator()
    {
        RuleFor(x => x.ClientId).NotEqual(Guid.Empty);

        RuleFor(x => x.Description)
            .NotEmpty()
            .MinimumLength(10)
            .MaximumLength(4000);

        RuleFor(x => x.Priority).IsInEnum();
    }
}
