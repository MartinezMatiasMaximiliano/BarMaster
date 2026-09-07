using BackEndAPI.Models.Impresion;
using BackEndAPI.Impresion.Estaciones;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers;

[ApiController]
[Route("api/impresion/estaciones")]
public sealed class EstacionesImpresionController : ControllerBase
{
    private readonly IServicioEstacionImpresion servicioEstacion;

    public EstacionesImpresionController(IServicioEstacionImpresion servicioEstacion)
    {
        this.servicioEstacion = servicioEstacion;
    }

    [Authorize(Policy = "Impresion.Usar")]
    [HttpPost("registrar")]
    public async Task<ActionResult<EstacionImpresionRespuesta>> Registrar(
        RegistrarEstacionImpresionSolicitud solicitud,
        CancellationToken tokenCancelacion) =>
        Ok(await servicioEstacion.RegistrarAsync(solicitud, tokenCancelacion));

    [Authorize(Policy = "Impresion.Usar")]
    [HttpGet("actual")]
    public async Task<ActionResult<EstacionImpresionRespuesta>> ObtenerActual(
        [FromQuery] Guid idInstalacionCliente,
        CancellationToken tokenCancelacion)
    {
        var estacion = await servicioEstacion.ObtenerActualAsync(idInstalacionCliente, tokenCancelacion);
        return estacion is null ? NotFound() : Ok(estacion);
    }

    [Authorize(Policy = "Impresion.OperarEstacion")]
    [HttpPost("{idEstacion:guid}/latido")]
    public async Task<ActionResult<EstacionImpresionRespuesta>> RegistrarLatido(Guid idEstacion, CancellationToken tokenCancelacion) =>
        Ok(await servicioEstacion.RegistrarLatidoAsync(idEstacion, tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpPatch("{idEstacion:guid}/habilitada")]
    public async Task<ActionResult<EstacionImpresionRespuesta>> EstablecerHabilitada(
        Guid idEstacion,
        EstablecerEstacionImpresionHabilitadaSolicitud solicitud,
        CancellationToken tokenCancelacion) =>
        Ok(await servicioEstacion.EstablecerHabilitadaAsync(idEstacion, solicitud.Habilitada, tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpPost("{idEstacion:guid}/revocar")]
    public async Task<ActionResult<EstacionImpresionRespuesta>> Revocar(Guid idEstacion, CancellationToken tokenCancelacion) =>
        Ok(await servicioEstacion.EstablecerHabilitadaAsync(idEstacion, false, tokenCancelacion));
}
