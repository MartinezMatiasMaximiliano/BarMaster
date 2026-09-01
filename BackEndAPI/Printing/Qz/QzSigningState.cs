namespace BackEndAPI.Printing.Qz;

public sealed record QzSigningState(
    bool Enabled,
    bool Ready,
    bool Degraded,
    DateTime? NotBeforeUtc,
    DateTime? NotAfterUtc,
    int? RemainingDays,
    string? CertificateSha256,
    string? RootCertificateSha256);
