using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.RegularExpressions;

namespace BackEndAPI.Printing.Qz;

public sealed class QzSigningService : IQzSigningService, IDisposable
{
    private static readonly Regex DigestPattern = new("^[0-9a-f]{64}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    private readonly QzCertificateMaterial? material;

    public QzSigningService(IOptions<QzSigningOptions> optionsAccessor, ILogger<QzSigningService> logger)
    {
        var options = optionsAccessor.Value;
        if (!options.Enabled)
        {
            State = new QzSigningState(false, false, false, null, null, null, null, null);
            return;
        }

        material = QzCertificateMaterial.LoadAndValidate(options);
        var notBefore = material.Certificate.NotBefore.ToUniversalTime();
        var notAfter = material.Certificate.NotAfter.ToUniversalTime();
        var remainingDays = Math.Max(0, (int)Math.Floor((notAfter - DateTime.UtcNow).TotalDays));
        var degraded = remainingDays < options.MinimumRemainingDays;
        if (degraded)
            logger.LogWarning("El certificado firmante QZ vence en {RemainingDays} días.", remainingDays);

        State = new QzSigningState(
            true,
            true,
            degraded,
            notBefore,
            notAfter,
            remainingDays,
            material.Certificate.GetCertHashString(HashAlgorithmName.SHA256),
            material.Root.GetCertHashString(HashAlgorithmName.SHA256));
    }

    public QzSigningState State { get; }

    public string GetPublicCertificatePem()
    {
        EnsureReady();
        return material!.Certificate.ExportCertificatePem();
    }

    public string SignDigest(string digest)
    {
        EnsureReady();
        if (!DigestPattern.IsMatch(digest))
            throw new ArgumentException("El digest QZ debe contener exactamente 64 caracteres hexadecimales minúsculos.", nameof(digest));

        using var rsa = material!.Certificate.GetRSAPrivateKey()
            ?? throw new InvalidOperationException("La clave privada QZ no es RSA.");
        var signature = rsa.SignData(
            Encoding.UTF8.GetBytes(digest),
            HashAlgorithmName.SHA512,
            RSASignaturePadding.Pkcs1);
        return Convert.ToBase64String(signature);
    }

    public void Dispose() => material?.Dispose();

    private void EnsureReady()
    {
        if (!State.Enabled || !State.Ready || material is null)
            throw new InvalidOperationException("QZ_SIGNING_DISABLED");
    }
}
