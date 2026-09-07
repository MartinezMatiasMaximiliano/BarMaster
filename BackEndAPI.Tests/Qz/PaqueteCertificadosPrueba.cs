using BackEndAPI.Impresion.Qz;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace BackEndAPI.Tests.Qz;

internal sealed class PaqueteCertificadosPrueba : IDisposable
{
    private PaqueteCertificadosPrueba(string directorio, string contrasena, X509Certificate2 hoja, X509Certificate2 raiz)
    {
        Directorio = directorio;
        Contrasena = contrasena;
        Hoja = hoja;
        Raiz = raiz;
    }

    public string Directorio { get; }
    public string Contrasena { get; }
    public X509Certificate2 Hoja { get; }
    public X509Certificate2 Raiz { get; }
    public string RutaPfx => Path.Combine(Directorio, "signing.pfx");
    public string RutaRaiz => Path.Combine(Directorio, "root.crt.pem");

    public static PaqueteCertificadosPrueba Crear(DateTimeOffset? noDespuesDe = null)
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
        var expires = noDespuesDe ?? DateTimeOffset.UtcNow.AddYears(1);
        using var issuedLeaf = leafRequest.Create(root, DateTimeOffset.UtcNow.AddDays(-1), expires, RandomNumberGenerator.GetBytes(16));
        var leaf = issuedLeaf.CopyWithPrivateKey(leafKey);

        var collection = new X509Certificate2Collection();
        collection.Add(leaf);
        collection.Add(root);
        File.WriteAllBytes(Path.Combine(directory, "signing.pfx"), collection.Export(X509ContentType.Pfx, password)!);
        File.WriteAllText(Path.Combine(directory, "root.crt.pem"), root.ExportCertificatePem());
        return new PaqueteCertificadosPrueba(directory, password, leaf, root);
    }

    public OpcionesFirmaQz CrearOpciones() => new()
    {
        Habilitada = true,
        RutaPfx = this.RutaPfx,
        ContrasenaPfx = Contrasena,
        RutaCertificadoRaiz = RutaRaiz,
        Sha256CertificadoEsperado = Hoja.GetCertHashString(HashAlgorithmName.SHA256),
        Sha256CertificadoRaizEsperado = Raiz.GetCertHashString(HashAlgorithmName.SHA256),
        MinimoDiasRestantes = 30
    };

    public void Dispose()
    {
        Hoja.Dispose();
        Raiz.Dispose();
        if (System.IO.Directory.Exists(Directorio))
            System.IO.Directory.Delete(Directorio, true);
    }
}
