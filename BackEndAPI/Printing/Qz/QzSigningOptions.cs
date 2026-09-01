namespace BackEndAPI.Printing.Qz;

public sealed class QzSigningOptions
{
    public const string SectionName = "QzSigning";

    public bool Enabled { get; set; }
    public bool AllowUnregisteredStationsInDevelopment { get; set; }
    public string PfxPath { get; set; } = string.Empty;
    public string PfxPassword { get; set; } = string.Empty;
    public string RootCertificatePath { get; set; } = string.Empty;
    public string ExpectedCertificateSha256 { get; set; } = string.Empty;
    public string ExpectedRootCertificateSha256 { get; set; } = string.Empty;
    public int MinimumRemainingDays { get; set; } = 30;
}
