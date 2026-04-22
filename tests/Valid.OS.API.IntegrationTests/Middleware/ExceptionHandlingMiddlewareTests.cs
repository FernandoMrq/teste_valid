using System.Text.Json;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Valid.OS.API.Middleware;
using Valid.OS.Application.Exceptions;
using Valid.OS.Domain.Exceptions;

namespace Valid.OS.API.IntegrationTests.Middleware;

public sealed class ExceptionHandlingMiddlewareTests
{
    private static async Task<(int Status, JsonElement Body)> InvokeAsync(Exception exception)
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        var middleware = new ExceptionHandlingMiddleware(
            _ => throw exception,
            NullLogger<ExceptionHandlingMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body);
        var body = await reader.ReadToEndAsync();
        var json = body.Length > 0 ? JsonDocument.Parse(body).RootElement : default;
        return (context.Response.StatusCode, json);
    }

    [Fact]
    public async Task Validation_exception_maps_to_400_with_errors()
    {
        var ex = new AppValidationException(new[]
        {
            new ValidationFailure("Name", "obrigatório"),
        });

        var (status, body) = await InvokeAsync(ex);

        Assert.Equal(StatusCodes.Status400BadRequest, status);
        Assert.True(body.GetProperty("errors").TryGetProperty("Name", out _));
    }

    [Fact]
    public async Task NotFound_maps_to_404()
    {
        var (status, body) = await InvokeAsync(new NotFoundException("x"));
        Assert.Equal(StatusCodes.Status404NotFound, status);
        Assert.Equal("x", body.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task DomainException_maps_to_422()
    {
        var (status, _) = await InvokeAsync(new DomainException("violou regra"));
        Assert.Equal(StatusCodes.Status422UnprocessableEntity, status);
    }

    [Fact]
    public async Task Unauthorized_maps_to_401()
    {
        var (status, _) = await InvokeAsync(new UnauthorizedAccessException("no"));
        Assert.Equal(StatusCodes.Status401Unauthorized, status);
    }

    [Fact]
    public async Task Unknown_maps_to_500()
    {
        var (status, _) = await InvokeAsync(new InvalidOperationException("boom"));
        Assert.Equal(StatusCodes.Status500InternalServerError, status);
    }
}
