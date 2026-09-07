using BackEndAPI.Impresion.Qz;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace BackEndAPI.Controllers;

[ApiController]
[Route("api/qz")]
public sealed class QzController : ControllerBase
{
    private readonly IServicioFirmaQz servicioFirma;
    private readonly IServicioEstacionImpresion servicioEstacion;
    private readonly OpcionesFirmaQz opciones;
    private readonly IWebHostEnvironment entorno;

    public QzController(
        IServicioFirmaQz servicioFirma,
        IServicioEstacionImpresion servicioEstacion,
        IOptions<OpcionesFirmaQz> opciones,
        IWebHostEnvironment entorno)
    {
        this.servicioFirma = servicioFirma;
        this.servicioEstacion = servicioEstacion;
        this.opciones = opciones.Value;
        this.entorno = entorno;
    }

    [AllowAnonymous]
    [HttpGet("certificado")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult ObtenerCertificado()
    {
        if (!servicioFirma.Estado.Lista)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "FIRMA_QZ_DESHABILITADA");
        return Content(servicioFirma.ObtenerCertificadoPublicoPem(), "text/plain; charset=utf-8");
    }

    [Authorize(Policy = "Impresion.Firmar")]
    [EnableRateLimiting("FirmaQz")]
    [HttpPost("firmar")]
    [RequestSizeLimit(4096)]
    public async Task<IActionResult> Firmar(SolicitudFirmaQz solicitud, CancellationToken tokenCancelacion)
    {
        if (!servicioFirma.Estado.Lista)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "FIRMA_QZ_DESHABILITADA");

        var claimEstacion = User.FindFirst("EstacionImpresionId")?.Value;
        var cabeceraEstacion = Request.Headers["X-Estacion-Impresion-ID"].ToString();
        var estacionProporcionada = Guid.TryParse(claimEstacion, out var idEstacionClaim)
            ? idEstacionClaim
            : Guid.TryParse(cabeceraEstacion, out var idEstacionCabecera) ? idEstacionCabecera : Guid.Empty;
        if (estacionProporcionada == Guid.Empty || estacionProporcionada != solicitud.IdEstacion)
            return BadRequest(new { error = new { codigo = "ESTACION_NO_COINCIDE", mensaje = "La estación del encabezado y del cuerpo no coinciden." } });

        var permitirDesarrollo = entorno.IsDevelopment() && opciones.PermitirEstacionesNoRegistradasEnDesarrollo;
        if (!permitirDesarrollo && !await servicioEstacion.PuedeUsarAsync(solicitud.IdEstacion, tokenCancelacion))
            return StatusCode(StatusCodes.Status403Forbidden, new { error = new { codigo = "ESTACION_NO_AUTORIZADA", mensaje = "La estación no está autorizada." } });

        try
        {
            return Content(servicioFirma.FirmarResumen(solicitud.Solicitud), "text/plain; charset=utf-8");
        }
        catch (ArgumentException)
        {
            return BadRequest(new { error = new { codigo = "RESUMEN_QZ_INVALIDO", mensaje = "El resumen QZ es inválido." } });
        }
    }

    [AllowAnonymous]
    [HttpGet("estado")]
    public IActionResult ObtenerEstado() => Ok(new
    {
        habilitada = servicioFirma.Estado.Habilitada,
        lista = servicioFirma.Estado.Lista
    });

    [Authorize(Policy = "Impresion.Diagnosticos")]
    [HttpGet("estado/detalle")]
    public IActionResult ObtenerDetalleEstado()
    {
        var estado = servicioFirma.Estado;
        return Ok(new
        {
            estado.Habilitada,
            estado.Lista,
            estado.Degradado,
            estado.ValidoDesdeUtc,
            estado.ValidoHastaUtc,
            estado.DiasRestantes,
            sha256Certificado = Abreviar(estado.Sha256Certificado),
            sha256CertificadoRaiz = Abreviar(estado.Sha256CertificadoRaiz)
        });
    }

    private static string? Abreviar(string? valor) => valor is null ? null : $"{valor[..12]}…{valor[^12..]}";
}
