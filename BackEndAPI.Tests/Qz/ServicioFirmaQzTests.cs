using BackEndAPI.Impresion.Qz;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace BackEndAPI.Tests.Qz;

public sealed class ServicioFirmaQzTests
{
    [Fact]
    public void FirmaResumenCanonicoConRsaSha512()
    {
        using var bundle = PaqueteCertificadosPrueba.Crear();
        using var service = new ServicioFirmaQz(Options.Create(bundle.CrearOpciones()), NullLogger<ServicioFirmaQz>.Instance);
        const string digest = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        var signature = Convert.FromBase64String(service.FirmarResumen(digest));
        using var rsa = bundle.Hoja.GetRSAPublicKey();

        Assert.True(rsa!.VerifyData(Encoding.UTF8.GetBytes(digest), signature, HashAlgorithmName.SHA512, RSASignaturePadding.Pkcs1));
        Assert.Single(service.ObtenerCertificadoPublicoPem().Split("-----BEGIN CERTIFICATE-----", StringSplitOptions.RemoveEmptyEntries));
        Assert.True(service.Estado.Lista);
    }

    [Theory]
    [InlineData("")]
    [InlineData("ABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD")]
    [InlineData("xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzx")]
    public void RechazaResumenNoCanonico(string digest)
    {
        using var bundle = PaqueteCertificadosPrueba.Crear();
        using var service = new ServicioFirmaQz(Options.Create(bundle.CrearOpciones()), NullLogger<ServicioFirmaQz>.Instance);
        Assert.Throws<ArgumentException>(() => service.FirmarResumen(digest));
    }

    [Fact]
    public void ServicioDeshabilitadoNoCargaArchivos()
    {
        using var service = new ServicioFirmaQz(Options.Create(new OpcionesFirmaQz { Habilitada = false }), NullLogger<ServicioFirmaQz>.Instance);
        Assert.False(service.Estado.Lista);
        Assert.Throws<InvalidOperationException>(() => service.FirmarResumen(new string('a', 64)));
    }
}
