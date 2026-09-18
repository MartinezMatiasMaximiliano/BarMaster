using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace BackEndAPI.Impresion.Qz;

internal sealed class MaterialCertificadoQz : IDisposable
{
    private MaterialCertificadoQz(X509Certificate2 certificado, X509Certificate2 raiz)
    {
        Certificado = certificado;
        Raiz = raiz;
    }

    public X509Certificate2 Certificado { get; }
    public X509Certificate2 Raiz { get; }

    public static MaterialCertificadoQz CargarYValidar(OpcionesFirmaQz opciones)
    {
        var errores = new List<string>();
        if (!File.Exists(opciones.RutaPfx)) errores.Add("El PFX no existe.");
        if (!File.Exists(opciones.RutaCertificadoRaiz)) errores.Add("El certificado raíz no existe.");
        if (errores.Count > 0) throw new InvalidOperationException(string.Join(" ", errores));

        X509Certificate2? certificado = null;
        X509Certificate2? raiz = null;
        try
        {
            certificado = new X509Certificate2(
                opciones.RutaPfx,
                opciones.ContrasenaPfx,
                X509KeyStorageFlags.EphemeralKeySet);
            raiz = X509Certificate2.CreateFromPem(File.ReadAllText(opciones.RutaCertificadoRaiz));

            ValidarCertificado(certificado, raiz, opciones, errores);
            if (errores.Count > 0) throw new InvalidOperationException(string.Join(" ", errores));
            return new MaterialCertificadoQz(certificado, raiz);
        }
        catch
        {
            certificado?.Dispose();
            raiz?.Dispose();
            throw;
        }
    }

    public void Dispose()
    {
        Certificado.Dispose();
        Raiz.Dispose();
    }

    private static void ValidarCertificado(
        X509Certificate2 certificado,
        X509Certificate2 raiz,
        OpcionesFirmaQz opciones,
        ICollection<string> errores)
    {
        var ahora = DateTime.UtcNow;
        if (!certificado.HasPrivateKey) errores.Add("El PFX no contiene una clave privada.");
        using (var rsa = certificado.GetRSAPrivateKey())
        {
            if (rsa is null) errores.Add("La clave firmante no es RSA.");
            else if (rsa.KeySize != 2048) errores.Add("La clave firmante debe ser RSA de 2048 bits.");
        }

        if (certificado.NotBefore.ToUniversalTime() > ahora) errores.Add("El certificado firmante todavía no es válido.");
        if (certificado.NotAfter.ToUniversalTime() <= ahora) errores.Add("El certificado firmante está vencido.");
        if (string.IsNullOrWhiteSpace(certificado.GetNameInfo(X509NameType.SimpleName, false))) errores.Add("El CN firmante está vacío.");

        ValidarExtensionesHoja(certificado, errores);
        ValidarExtensionesRaiz(raiz, errores);
        ValidarHash(certificado, opciones.Sha256CertificadoEsperado, "hoja", errores);
        ValidarHash(raiz, opciones.Sha256CertificadoRaizEsperado, "raíz", errores);

        using var cadena = new X509Chain();
        cadena.ChainPolicy.TrustMode = X509ChainTrustMode.CustomRootTrust;
        cadena.ChainPolicy.CustomTrustStore.Add(raiz);
        cadena.ChainPolicy.RevocationMode = X509RevocationMode.NoCheck;
        cadena.ChainPolicy.DisableCertificateDownloads = true;
        cadena.ChainPolicy.VerificationFlags = X509VerificationFlags.NoFlag;
        if (!cadena.Build(certificado))
        {
            var detalles = string.Join(", ", cadena.ChainStatus.Select(x => x.StatusInformation.Trim()).Where(x => x.Length > 0));
            errores.Add($"La hoja no encadena a la raíz configurada: {detalles}");
        }
    }

    private static void ValidarExtensionesHoja(X509Certificate2 certificado, ICollection<string> errores)
    {
        var restriccionesBasicas = certificado.Extensions.OfType<X509BasicConstraintsExtension>().SingleOrDefault();
        if (restriccionesBasicas is null || restriccionesBasicas.CertificateAuthority) errores.Add("La hoja debe declarar CA:FALSE.");
        var uso = certificado.Extensions.OfType<X509KeyUsageExtension>().SingleOrDefault();
        if (uso is null || !uso.KeyUsages.HasFlag(X509KeyUsageFlags.DigitalSignature))
            errores.Add("La hoja debe permitir Digital Signature.");
    }

    private static void ValidarExtensionesRaiz(X509Certificate2 raiz, ICollection<string> errores)
    {
        var restriccionesBasicas = raiz.Extensions.OfType<X509BasicConstraintsExtension>().SingleOrDefault();
        if (restriccionesBasicas is null || !restriccionesBasicas.CertificateAuthority) errores.Add("La raíz debe declarar CA:TRUE.");
        var uso = raiz.Extensions.OfType<X509KeyUsageExtension>().SingleOrDefault();
        if (uso is null || !uso.KeyUsages.HasFlag(X509KeyUsageFlags.KeyCertSign))
            errores.Add("La raíz debe permitir Certificate Signing.");
        if (!raiz.SubjectName.RawData.AsSpan().SequenceEqual(raiz.IssuerName.RawData))
            errores.Add("La raíz debe ser autofirmada (Subject e Issuer deben coincidir).");
        if (raiz.NotBefore.ToUniversalTime() > DateTime.UtcNow) errores.Add("El certificado raíz todavía no es válido.");
        if (raiz.NotAfter.ToUniversalTime() <= DateTime.UtcNow) errores.Add("El certificado raíz está vencido.");
    }

    private static void ValidarHash(X509Certificate2 certificado, string esperado, string etiqueta, ICollection<string> errores)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(esperado ?? string.Empty, "^[0-9A-F]{64}$"))
        {
            errores.Add($"El SHA-256 esperado de {etiqueta} no tiene el formato canónico.");
            return;
        }

        if (!CryptographicOperations.FixedTimeEquals(
                Convert.FromHexString(certificado.GetCertHashString(HashAlgorithmName.SHA256)),
                Convert.FromHexString(esperado!)))
            errores.Add($"El SHA-256 de {etiqueta} no coincide con el configurado.");
    }
}
