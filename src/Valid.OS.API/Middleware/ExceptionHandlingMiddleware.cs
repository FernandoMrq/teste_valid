using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Valid.OS.Application.Exceptions;
using Valid.OS.Domain.Exceptions;

namespace Valid.OS.API.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex).ConfigureAwait(false);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception exception)
    {
        switch (exception)
        {
            case AppValidationException:
            case DomainException:
            case NotFoundException:
            case UnauthorizedAccessException:
                logger.LogWarning(exception, "Handled exception mapped to HTTP response");
                break;
            default:
                logger.LogError(exception, "Unhandled exception");
                break;
        }

        if (context.Response.HasStarted)
        {
            throw exception;
        }

        var (statusCode, problem) = MapException(exception);

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem, JsonOptions)).ConfigureAwait(false);
    }

    private static (int StatusCode, ProblemDetails Details) MapException(Exception exception)
    {
        return exception switch
        {
            AppValidationException validationException => (
                StatusCodes.Status400BadRequest,
                new ProblemDetails
                {
                    Title = "Erros de validação",
                    Status = StatusCodes.Status400BadRequest,
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Detail = validationException.Message,
                    Extensions =
                    {
                        ["errors"] = validationException.Failures
                            .GroupBy(f => f.PropertyName)
                            .ToDictionary(
                                g => g.Key,
                                g => g.Select(f => f.ErrorMessage).ToArray()),
                    },
                }),

            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                new ProblemDetails
                {
                    Title = "Não autorizado",
                    Status = StatusCodes.Status401Unauthorized,
                    Type = "https://tools.ietf.org/html/rfc7235#section-3.1",
                }),

            NotFoundException notFound => (
                StatusCodes.Status404NotFound,
                new ProblemDetails
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                    Detail = notFound.Message,
                }),

            DomainException domain => (
                (int)HttpStatusCode.UnprocessableEntity,
                new ProblemDetails
                {
                    Title = "Regra de negócio violada",
                    Status = (int)HttpStatusCode.UnprocessableEntity,
                    Type = "https://tools.ietf.org/html/rfc4918#section-11.2",
                    Detail = domain.Message,
                }),

            _ => (
                StatusCodes.Status500InternalServerError,
                new ProblemDetails
                {
                    Title = "Erro interno do servidor",
                    Status = StatusCodes.Status500InternalServerError,
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                    Detail = "Ocorreu um erro inesperado.",
                }),
        };
    }
}
