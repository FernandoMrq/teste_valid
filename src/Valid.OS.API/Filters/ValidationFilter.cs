using System.Reflection;
using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Valid.OS.Application.Exceptions;

namespace Valid.OS.API.Filters;

public sealed class ValidationFilter(IServiceProvider serviceProvider) : IAsyncActionFilter
{
    private static readonly MethodInfo ValidateCoreAsyncOpen = typeof(ValidationFilter).GetMethod(
        nameof(ValidateCoreAsync),
        BindingFlags.Static | BindingFlags.NonPublic)!;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values.OfType<object>())
        {
            await ValidateArgumentAsync(argument, context.HttpContext.RequestAborted).ConfigureAwait(false);
        }

        await next().ConfigureAwait(false);
    }

    private async Task ValidateArgumentAsync(object argument, CancellationToken cancellationToken)
    {
        var method = ValidateCoreAsyncOpen.MakeGenericMethod(argument.GetType());
        var task = (Task)method.Invoke(null, [serviceProvider, argument, cancellationToken])!;
        await task.ConfigureAwait(false);
    }

    private static async Task ValidateCoreAsync<T>(
        IServiceProvider services,
        T instance,
        CancellationToken cancellationToken)
        where T : class
    {
        var validator = services.GetService<IValidator<T>>();
        if (validator is null)
        {
            return;
        }

        var result = await validator
            .ValidateAsync(new ValidationContext<T>(instance), cancellationToken)
            .ConfigureAwait(false);

        if (!result.IsValid)
        {
            throw new AppValidationException(result.Errors);
        }
    }
}
