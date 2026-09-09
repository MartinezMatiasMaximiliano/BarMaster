using BackEndAPI.Impresion.Seguridad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BackEndAPI.Controllers;

[ApiController]
[Route("impresion/estaciones")]
[ApiExplorerSettings(IgnoreApi = true)]
public sealed class SeguridadEstacionesImpresionController : ControllerBase
{
    private readonly IServicioCredencialEstacion servicioCredencial;

    public SeguridadEstacionesImpresionController(IServicioCredencialEstacion servicioCredencial)
    {
        this.servicioCredencial = servicioCredencial;
    }

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpPost("alta")]
    public async Task<ActionResult<AltaEstacionImpresionRespuesta>> DarAlta(
        DarAltaEstacionImpresionSolicitud solicitud,
        CancellationToken tokenCancelacion) =>
        Ok(await servicioCredencial.DarAltaAsync(solicitud, tokenCancelacion));

    [AllowAnonymous]
    [EnableRateLimiting("SesionEstacionImpresion")]
    [HttpPost("sesion")]
    public async Task<ActionResult<SesionEstacionImpresionRespuesta>> CrearSesion(
        CrearSesionEstacionImpresionSolicitud solicitud,
        CancellationToken tokenCancelacion) =>
        Ok(await servicioCredencial.CrearSesionAsync(solicitud, tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpPost("{idEstacion:guid}/rotar-credencial")]
    public async Task<ActionResult<RotarCredencialEstacionImpresionRespuesta>> RotarCredencial(
        Guid idEstacion,
        CancellationToken tokenCancelacion) =>
        Ok(await servicioCredencial.RotarAsync(idEstacion, tokenCancelacion));
}
