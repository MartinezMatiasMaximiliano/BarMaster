using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace BackEndAPI.Printing.Qz;

internal sealed class QzCertificateMaterial : IDisposable
{
    private QzCertificateMaterial(X509Certificate2 certificate, X509Certificate2 root)
    {
        Certificate = certificate;
        Root = root;
    }

    public X509Certificate2 Certificate { get; }
    public X509Certificate2 Root { get; }

    public static QzCertificateMaterial LoadAndValidate(QzSigningOptions options)
    {
        var errors = new List<string>();
        if (!File.Exists(options.PfxPath)) errors.Add("El PFX no existe.");
        if (!File.Exists(options.RootCertificatePath)) errors.Add("El certificado raíz no existe.");
        if (errors.Count > 0) throw new InvalidOperationException(string.Join(" ", errors));

        X509Certificate2? certificate = null;
        X509Certificate2? root = null;
        try
        {
            certificate = new X509Certificate2(
                options.PfxPath,
                options.PfxPassword,
                X509KeyStorageFlags.EphemeralKeySet);
            root = X509Certificate2.CreateFromPem(File.ReadAllText(options.RootCertificatePath));

            ValidateCertificate(certificate, root, options, errors);
            if (errors.Count > 0) throw new InvalidOperationException(string.Join(" ", errors));
            return new QzCertificateMaterial(certificate, root);
        }
        catch
        {
            certificate?.Dispose();
            root?.Dispose();
            throw;
        }
    }

    public void Dispose()
    {
        Certificate.Dispose();
        Root.Dispose();
    }

    private static void ValidateCertificate(
        X509Certificate2 certificate,
        X509Certificate2 root,
        QzSigningOptions options,
        ICollection<string> errors)
    {
        var now = DateTime.UtcNow;
        if (!certificate.HasPrivateKey) errors.Add("El PFX no contiene una clave privada.");
        using (var rsa = certificate.GetRSAPrivateKey())
        {
            if (rsa is null) errors.Add("La clave firmante no es RSA.");
            else if (rsa.KeySize != 2048) errors.Add("La clave firmante debe ser RSA de 2048 bits.");
        }

        if (certificate.NotBefore.ToUniversalTime() > now) errors.Add("El certificado firmante todavía no es válido.");
        if (certificate.NotAfter.ToUniversalTime() <= now) errors.Add("El certificado firmante está vencido.");
        if (string.IsNullOrWhiteSpace(certificate.GetNameInfo(X509NameType.SimpleName, false))) errors.Add("El CN firmante está vacío.");

        ValidateLeafExtensions(certificate, errors);
        ValidateRootExtensions(root, errors);
        ValidateHash(certificate, options.ExpectedCertificateSha256, "hoja", errors);
        ValidateHash(root, options.ExpectedRootCertificateSha256, "raíz", errors);

        using var chain = new X509Chain();
        chain.ChainPolicy.TrustMode = X509ChainTrustMode.CustomRootTrust;
        chain.ChainPolicy.CustomTrustStore.Add(root);
        chain.ChainPolicy.RevocationMode = X509RevocationMode.NoCheck;
        chain.ChainPolicy.DisableCertificateDownloads = true;
        chain.ChainPolicy.VerificationFlags = X509VerificationFlags.NoFlag;
        if (!chain.Build(certificate))
        {
            var details = string.Join(", ", chain.ChainStatus.Select(x => x.StatusInformation.Trim()).Where(x => x.Length > 0));
            errors.Add($"La hoja no encadena a la raíz configurada: {details}");
        }
    }

    private static void ValidateLeafExtensions(X509Certificate2 certificate, ICollection<string> errors)
    {
        var basic = certificate.Extensions.OfType<X509BasicConstraintsExtension>().SingleOrDefault();
        if (basic is null || basic.CertificateAuthority) errors.Add("La hoja debe declarar CA:FALSE.");
        var usage = certificate.Extensions.OfType<X509KeyUsageExtension>().SingleOrDefault();
        if (usage is null || !usage.KeyUsages.HasFlag(X509KeyUsageFlags.DigitalSignature))
            errors.Add("La hoja debe permitir Digital Signature.");
    }

    private static void ValidateRootExtensions(X509Certificate2 root, ICollection<string> errors)
    {
        var basic = root.Extensions.OfType<X509BasicConstraintsExtension>().SingleOrDefault();
        if (basic is null || !basic.CertificateAuthority) errors.Add("La raíz debe declarar CA:TRUE.");
        var usage = root.Extensions.OfType<X509KeyUsageExtension>().SingleOrDefault();
        if (usage is null || !usage.KeyUsages.HasFlag(X509KeyUsageFlags.KeyCertSign))
            errors.Add("La raíz debe permitir Certificate Signing.");
        if (!root.SubjectName.RawData.AsSpan().SequenceEqual(root.IssuerName.RawData))
            errors.Add("La raíz debe ser autofirmada (Subject e Issuer deben coincidir).");
        if (root.NotBefore.ToUniversalTime() > DateTime.UtcNow) errors.Add("El certificado raíz todavía no es válido.");
        if (root.NotAfter.ToUniversalTime() <= DateTime.UtcNow) errors.Add("El certificado raíz está vencido.");
    }

    private static void ValidateHash(X509Certificate2 certificate, string expected, string label, ICollection<string> errors)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(expected ?? string.Empty, "^[0-9A-F]{64}$"))
        {
            errors.Add($"El SHA-256 esperado de {label} no tiene el formato canónico.");
            return;
        }

        if (!CryptographicOperations.FixedTimeEquals(
                Convert.FromHexString(certificate.GetCertHashString(HashAlgorithmName.SHA256)),
                Convert.FromHexString(expected!)))
            errors.Add($"El SHA-256 de {label} no coincide con el configurado.");
    }
}
