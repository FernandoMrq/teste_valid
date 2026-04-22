namespace Valid.OS.Application.DTOs;

public sealed record ServiceOrderSummaryDto(
    int OpenTotal,
    int CriticalOpenCount,
    int ClosedLast7Days);
