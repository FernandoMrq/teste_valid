using FluentValidation;

namespace Valid.OS.Application.Services.ServiceOrders.Commands;

public sealed class UpdateServiceOrderCommandValidator : AbstractValidator<UpdateServiceOrderCommand>
{
    public UpdateServiceOrderCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty);

        RuleFor(x => x.Description)
            .NotEmpty()
            .MinimumLength(10)
            .MaximumLength(4000);

        RuleFor(x => x.Priority).IsInEnum();
    }
}
