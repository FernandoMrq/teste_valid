namespace Valid.OS.Domain;

/// <summary>
/// Totais agregados de ordens de serviço para o dashboard.
/// </summary>
public readonly record struct ServiceOrderSummary(
    int OpenTotal,
    int CriticalOpenCount,
    int ClosedLast7Days);
