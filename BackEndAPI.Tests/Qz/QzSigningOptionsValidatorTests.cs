using BackEndAPI.Printing.Qz;

namespace BackEndAPI.Tests.Qz;

public sealed class QzSigningOptionsValidatorTests
{
    private readonly QzSigningOptionsValidator validator = new();

    [Fact]
    public void AcceptsValidCustomRootChain()
    {
        using var bundle = TestCertificateBundle.Create();
        Assert.True(validator.Validate(null, bundle.CreateOptions()).Succeeded);
    }

    [Fact]
    public void RejectsMismatchedCertificatePin()
    {
        using var bundle = TestCertificateBundle.Create();
        var options = bundle.CreateOptions();
        options.ExpectedCertificateSha256 = new string('0', 64);
        var result = validator.Validate(null, options);
        Assert.False(result.Succeeded);
        Assert.Contains("hoja", result.FailureMessage, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void RejectsMissingPrivateKey()
    {
        using var bundle = TestCertificateBundle.Create();
        var publicOnlyPfx = Path.Combine(bundle.Directory, "public-only.pfx");
        using var publicOnly = new System.Security.Cryptography.X509Certificates.X509Certificate2(
            bundle.Leaf.Export(System.Security.Cryptography.X509Certificates.X509ContentType.Cert));
        File.WriteAllBytes(publicOnlyPfx, publicOnly.Export(System.Security.Cryptography.X509Certificates.X509ContentType.Pfx, bundle.Password));
        var options = bundle.CreateOptions();
        options.PfxPath = publicOnlyPfx;
        var result = validator.Validate(null, options);
        Assert.False(result.Succeeded);
    }
}
