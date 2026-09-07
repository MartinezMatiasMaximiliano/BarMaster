using BackEndAPI.Controllers;
using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion.Qz;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Tests.Qz;

public sealed class ControladorQzTests
{
    private static readonly Guid IdEstacion = Guid.Parse("309af557-644f-4e6e-918e-5fa68f6e6722");

    [Fact]
    public void Certificado_DevuelveSoloPemComoTextoPlano()
    {
        const string pem = "-----BEGIN CERTIFICATE-----\nAQID\n-----END CERTIFICATE-----\n";
        var controller = CrearControlador(new ServicioFirmaFalso(pem), canUse: true);

        var result = Assert.IsType<ContentResult>(controller.ObtenerCertificado());

        Assert.Equal(StatusCodes.Status200OK, result.StatusCode ?? StatusCodes.Status200OK);
        Assert.Equal("text/plain; charset=utf-8", result.ContentType);
        Assert.Equal(pem, result.Content);
    }

    [Fact]
    public async Task Firmar_RechazaEstacionDistintaEntreCabeceraYCuerpo()
    {
        var controller = CrearControlador(new ServicioFirmaFalso("pem"), canUse: true);
        controller.Request.Headers["X-Estacion-Impresion-ID"] = Guid.NewGuid().ToString();

        var result = await controller.Firmar(new SolicitudFirmaQz(new string('a', 64), IdEstacion), default);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Firmar_RechazaEstacionNoAutorizada()
    {
        var controller = CrearControlador(new ServicioFirmaFalso("pem"), canUse: false);
        controller.Request.Headers["X-Estacion-Impresion-ID"] = IdEstacion.ToString();

        var result = Assert.IsType<ObjectResult>(await controller.Firmar(new SolicitudFirmaQz(new string('a', 64), IdEstacion), default));

        Assert.Equal(StatusCodes.Status403Forbidden, result.StatusCode);
    }

    [Fact]
    public async Task Firmar_DevuelveBase64ComoTextoPlano()
    {
        var controller = CrearControlador(new ServicioFirmaFalso("pem", "signed-value"), canUse: true);
        controller.Request.Headers["X-Estacion-Impresion-ID"] = IdEstacion.ToString();

        var result = Assert.IsType<ContentResult>(await controller.Firmar(new SolicitudFirmaQz(new string('a', 64), IdEstacion), default));

        Assert.Equal("text/plain; charset=utf-8", result.ContentType);
        Assert.Equal("signed-value", result.Content);
    }

    private static QzController CrearControlador(IServicioFirmaQz signing, bool canUse)
    {
        var controller = new QzController(
            signing,
            new ServicioEstacionFalso(canUse),
            Options.Create(new OpcionesFirmaQz()),
            new EntornoFalso());
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        return controller;
    }

    private sealed class ServicioFirmaFalso(string pem, string signature = "signature") : IServicioFirmaQz
    {
        public EstadoFirmaQz Estado { get; } = new(true, true, false, null, null, null, null, null);
        public string ObtenerCertificadoPublicoPem() => pem;
        public string FirmarResumen(string digest) => signature;
    }

    private sealed class ServicioEstacionFalso(bool canUse) : IServicioEstacionImpresion
    {
        public Task<bool> PuedeUsarAsync(Guid stationId, CancellationToken cancellationToken) => Task.FromResult(canUse);
        public Task<EstacionImpresionRespuesta> RegistrarAsync(RegistrarEstacionImpresionSolicitud request, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<EstacionImpresionRespuesta?> ObtenerActualAsync(Guid clientInstallationId, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<EstacionImpresionRespuesta> RegistrarLatidoAsync(Guid stationId, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<EstacionImpresionRespuesta> EstablecerHabilitadaAsync(Guid stationId, bool enabled, CancellationToken cancellationToken) => throw new NotSupportedException();
    }

    private sealed class EntornoFalso : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Production";
        public string ApplicationName { get; set; } = "BackEndAPI.Tests";
        public string WebRootPath { get; set; } = string.Empty;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
