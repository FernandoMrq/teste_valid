using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using Valid.OS.Domain.Events;
using Valid.OS.Infrastructure.DomainEvents;

namespace Valid.OS.Infrastructure.Tests.DomainEvents;

public sealed record TestDomainEvent(Guid Id) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTimeOffset OccurredOn { get; } = DateTimeOffset.UtcNow;
}

public sealed class TestHandler : IDomainEventHandler<TestDomainEvent>
{
    public int Calls { get; private set; }
    public bool Throw { get; set; }

    public Task HandleAsync(TestDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        Calls++;
        if (Throw) throw new InvalidOperationException("fail");
        return Task.CompletedTask;
    }
}

public sealed class DomainEventDispatcherTests
{
    [Fact]
    public async Task Dispatches_to_all_registered_handlers()
    {
        var handler1 = new TestHandler();
        var handler2 = new TestHandler();
        var services = new ServiceCollection();
        services.AddSingleton<IDomainEventHandler<TestDomainEvent>>(handler1);
        services.AddSingleton<IDomainEventHandler<TestDomainEvent>>(handler2);
        var provider = services.BuildServiceProvider();

        var dispatcher = new DomainEventDispatcher(provider, NullLogger<DomainEventDispatcher>.Instance);
        await dispatcher.DispatchAsync(new TestDomainEvent(Guid.NewGuid()));

        Assert.Equal(1, handler1.Calls);
        Assert.Equal(1, handler2.Calls);
    }

    [Fact]
    public async Task WithNoHandlers_DoesNotThrow()
    {
        var provider = new ServiceCollection().BuildServiceProvider();
        var dispatcher = new DomainEventDispatcher(provider, NullLogger<DomainEventDispatcher>.Instance);

        await dispatcher.DispatchAsync(new TestDomainEvent(Guid.NewGuid()));
    }

    [Fact]
    public async Task WhenHandlerThrows_ExceptionPropagates()
    {
        var handler = new TestHandler { Throw = true };
        var services = new ServiceCollection();
        services.AddSingleton<IDomainEventHandler<TestDomainEvent>>(handler);
        var dispatcher = new DomainEventDispatcher(services.BuildServiceProvider(), NullLogger<DomainEventDispatcher>.Instance);

        var ex = await Assert.ThrowsAnyAsync<Exception>(() =>
            dispatcher.DispatchAsync(new TestDomainEvent(Guid.NewGuid())));
        Assert.True(ex is InvalidOperationException || ex.InnerException is InvalidOperationException);
    }
}
