using BackEndAPI.Printing.Qz;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace BackEndAPI.Tests.Qz;

internal sealed class TestCertificateBundle : IDisposable
{
    private TestCertificateBundle(string directory, string password, X509Certificate2 leaf, X509Certificate2 root)
    {
        Directory = directory;
        Password = password;
        Leaf = leaf;
        Root = root;
    }

    public string Directory { get; }
    public string Password { get; }
    public X509Certificate2 Leaf { get; }
    public X509Certificate2 Root { get; }
    public string PfxPath => Path.Combine(Directory, "signing.pfx");
    public string RootPath => Path.Combine(Directory, "root.crt.pem");

    public static TestCertificateBundle Create(DateTimeOffset? notAfter = null)
    {
        var directory = Path.Combine(Path.GetTempPath(), $"barmaster-qz-tests-{Guid.NewGuid():N}");
        System.IO.Directory.CreateDirectory(directory);
        var password = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));

        using var rootKey = RSA.Create(2048);
        var rootRequest = new CertificateRequest("CN=BarMaster QZ Test Root", rootKey, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
        rootRequest.CertificateExtensions.Add(new X509BasicConstraintsExtension(true, true, 0, true));
        rootRequest.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.KeyCertSign | X509KeyUsageFlags.CrlSign, true));
        rootRequest.CertificateExtensions.Add(new X509SubjectKeyIdentifierExtension(rootRequest.PublicKey, false));
        var root = rootRequest.CreateSelfSigned(DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddYears(2));

        using var leafKey = RSA.Create(2048);
        var leafRequest = new CertificateRequest("CN=BarMaster QZ Test", leafKey, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
        leafRequest.CertificateExtensions.Add(new X509BasicConstraintsExtension(false, false, 0, true));
        leafRequest.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, true));
        leafRequest.CertificateExtensions.Add(new X509SubjectKeyIdentifierExtension(leafRequest.PublicKey, false));
        var expires = notAfter ?? DateTimeOffset.UtcNow.AddYears(1);
        using var issuedLeaf = leafRequest.Create(root, DateTimeOffset.UtcNow.AddDays(-1), expires, RandomNumberGenerator.GetBytes(16));
        var leaf = issuedLeaf.CopyWithPrivateKey(leafKey);

        var collection = new X509Certificate2Collection();
        collection.Add(leaf);
        collection.Add(root);
        File.WriteAllBytes(Path.Combine(directory, "signing.pfx"), collection.Export(X509ContentType.Pfx, password)!);
        File.WriteAllText(Path.Combine(directory, "root.crt.pem"), root.ExportCertificatePem());
        return new TestCertificateBundle(directory, password, leaf, root);
    }

    public QzSigningOptions CreateOptions() => new()
    {
        Enabled = true,
        PfxPath = PfxPath,
        PfxPassword = Password,
        RootCertificatePath = RootPath,
        ExpectedCertificateSha256 = Leaf.GetCertHashString(HashAlgorithmName.SHA256),
        ExpectedRootCertificateSha256 = Root.GetCertHashString(HashAlgorithmName.SHA256),
        MinimumRemainingDays = 30
    };

    public void Dispose()
    {
        Leaf.Dispose();
        Root.Dispose();
        if (System.IO.Directory.Exists(Directory))
            System.IO.Directory.Delete(Directory, true);
    }
}
