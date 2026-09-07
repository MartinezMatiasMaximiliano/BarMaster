using BackEndAPI.Impresion.Qz;

namespace BackEndAPI.Tests.Qz;

public sealed class ValidadorOpcionesFirmaQzTests
{
    private readonly ValidadorOpcionesFirmaQz validador = new();

    [Fact]
    public void AceptaCadenaValidaConRaizPersonalizada()
    {
        using var bundle = PaqueteCertificadosPrueba.Crear();
        Assert.True(validador.Validate(null, bundle.CrearOpciones()).Succeeded);
    }

    [Fact]
    public void RechazaHuellaDeCertificadoQueNoCoincide()
    {
        using var bundle = PaqueteCertificadosPrueba.Crear();
        var options = bundle.CrearOpciones();
        options.Sha256CertificadoEsperado = new string('0', 64);
        var result = validador.Validate(null, options);
        Assert.False(result.Succeeded);
        Assert.Contains("hoja", result.FailureMessage, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void RechazaClavePrivadaFaltante()
    {
        using var bundle = PaqueteCertificadosPrueba.Crear();
        var publicOnlyPfx = Path.Combine(bundle.Directorio, "public-only.pfx");
        using var publicOnly = new System.Security.Cryptography.X509Certificates.X509Certificate2(
            bundle.Hoja.Export(System.Security.Cryptography.X509Certificates.X509ContentType.Cert));
        File.WriteAllBytes(publicOnlyPfx, publicOnly.Export(System.Security.Cryptography.X509Certificates.X509ContentType.Pfx, bundle.Contrasena));
        var options = bundle.CrearOpciones();
        options.RutaPfx = publicOnlyPfx;
        var result = validador.Validate(null, options);
        Assert.False(result.Succeeded);
    }
}
