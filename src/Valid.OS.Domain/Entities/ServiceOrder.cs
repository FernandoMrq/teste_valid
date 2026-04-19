using Valid.OS.Domain.Enums;
using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.Primitives;

namespace Valid.OS.Domain.Entities;

public sealed class ServiceOrder : Entity
{
    private ServiceOrder()
    {
    }

    public Guid Id { get; private set; }

    public Guid ClientId { get; private set; }

    public string Description { get; private set; } = null!;

    public Priority Priority { get; private set; }

    public ServiceOrderStatus Status { get; private set; }

    public Guid CreatedByUserId { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset UpdatedAt { get; private set; }

    public DateTimeOffset? ClosedAt { get; private set; }

    public static ServiceOrder Create(
        Guid clientId,
        string description,
        Priority priority,
        Guid createdByUserId)
    {
        if (clientId == Guid.Empty)
        {
            throw new DomainException("Cliente é obrigatório.");
        }

        if (createdByUserId == Guid.Empty)
        {
            throw new DomainException("Usuário criador é obrigatório.");
        }

        var desc = description?.Trim() ?? string.Empty;
        if (desc.Length < 10)
        {
            throw new DomainException("Descrição deve ter pelo menos 10 caracteres.");
        }

        var now = DateTimeOffset.UtcNow;

        return new ServiceOrder
        {
            Id = Guid.NewGuid(),
            ClientId = clientId,
            Description = desc,
            Priority = priority,
            Status = ServiceOrderStatus.Open,
            CreatedByUserId = createdByUserId,
            CreatedAt = now,
            UpdatedAt = now,
            ClosedAt = null,
        };
    }

    public void ChangeDescription(string description)
    {
        EnsureEditable();

        var desc = description?.Trim() ?? string.Empty;
        if (desc.Length < 10)
        {
            throw new DomainException("Descrição deve ter pelo menos 10 caracteres.");
        }

        Description = desc;
        Touch();
    }

    public void ChangePriority(Priority priority)
    {
        EnsureEditable();
        Priority = priority;
        Touch();
    }

    public void ChangeStatus(ServiceOrderStatus newStatus)
    {
        if (newStatus == Status)
        {
            return;
        }

        if (Status == ServiceOrderStatus.Closed)
        {
            throw new DomainException("Ordem de serviço fechada não pode ter o status alterado.");
        }

        Status = newStatus;
        Touch();

        if (newStatus == ServiceOrderStatus.Closed)
        {
            ClosedAt = DateTimeOffset.UtcNow;
        }
    }

    private void EnsureEditable()
    {
        if (Status == ServiceOrderStatus.Closed)
        {
            throw new DomainException("Ordem de serviço fechada não pode ser editada.");
        }
    }

    private void Touch()
    {
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
