using FluentValidation;

namespace Valid.OS.Application.Services.ServiceOrders.Commands;

public sealed class UpdateServiceOrderStatusCommandValidator : AbstractValidator<UpdateServiceOrderStatusCommand>
{
    public UpdateServiceOrderStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty);
        RuleFor(x => x.Status).IsInEnum();
    }
}
