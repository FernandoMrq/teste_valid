using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Valid.OS.Application.Exceptions;

namespace Valid.OS.API.Filters;

public sealed class ValidationFilter(IServiceProvider serviceProvider) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var cancellationToken = context.HttpContext.RequestAborted;

        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null or string)
            {
                continue;
            }

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (serviceProvider.GetService(validatorType) is not IValidator validator)
            {
                continue;
            }

            var result = await validator
                .ValidateAsync(new ValidationContext<object>(argument), cancellationToken)
                .ConfigureAwait(false);

            if (!result.IsValid)
            {
                throw new AppValidationException(result.Errors);
            }
        }

        await next().ConfigureAwait(false);
    }
}
