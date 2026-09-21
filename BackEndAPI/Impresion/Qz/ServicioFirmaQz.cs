using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.RegularExpressions;

namespace BackEndAPI.Impresion.Qz;

public sealed class ServicioFirmaQz : IServicioFirmaQz, IDisposable
{
    private static readonly Regex PatronResumen = new("^[0-9a-f]{64}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    private readonly MaterialCertificadoQz? material;

    public ServicioFirmaQz(IOptions<OpcionesFirmaQz> accesoOpciones, ILogger<ServicioFirmaQz> registrador)
    {
        var opciones = accesoOpciones.Value;
        if (!opciones.Habilitada)
        {
            Estado = new EstadoFirmaQz(false, false, false, null, null, null, null, null);
            return;
        }

        material = MaterialCertificadoQz.CargarYValidar(opciones);
        var validoDesde = material.Certificado.NotBefore.ToUniversalTime();
        var validoHasta = material.Certificado.NotAfter.ToUniversalTime();
        var diasRestantes = Math.Max(0, (int)Math.Floor((validoHasta - DateTime.UtcNow).TotalDays));
        var degradada = diasRestantes < opciones.MinimoDiasRestantes;
        if (degradada)
            registrador.LogWarning("El certificado firmante QZ vence en {DiasRestantes} días.", diasRestantes);

        Estado = new EstadoFirmaQz(
            true,
            true,
            degradada,
            validoDesde,
            validoHasta,
            diasRestantes,
            material.Certificado.GetCertHashString(HashAlgorithmName.SHA256),
            material.Raiz.GetCertHashString(HashAlgorithmName.SHA256));
    }

    public EstadoFirmaQz Estado { get; }

    public string ObtenerCertificadoPublicoPem()
    {
        AsegurarLista();
        return material!.Certificado.ExportCertificatePem();
    }

    public string FirmarResumen(string resumen)
    {
        AsegurarLista();
        if (!PatronResumen.IsMatch(resumen))
            throw new ArgumentException("El resumen QZ debe contener exactamente 64 caracteres hexadecimales minúsculos.", nameof(resumen));

        using var rsa = material!.Certificado.GetRSAPrivateKey()
            ?? throw new InvalidOperationException("La clave privada QZ no es RSA.");
        var firma = rsa.SignData(
            Encoding.UTF8.GetBytes(resumen),
            HashAlgorithmName.SHA512,
            RSASignaturePadding.Pkcs1);
        return Convert.ToBase64String(firma);
    }

    public void Dispose() => material?.Dispose();

    private void AsegurarLista()
    {
        if (!Estado.Habilitada || !Estado.Lista || material is null)
            throw new InvalidOperationException("FIRMA_QZ_DESHABILITADA");
    }
}
