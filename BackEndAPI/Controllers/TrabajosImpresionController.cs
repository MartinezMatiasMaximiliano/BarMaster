using BackEndAPI.Impresion.Trabajos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers;

[ApiController]
[Route("impresion")]
[ApiExplorerSettings(IgnoreApi = true)]
public sealed class TrabajosImpresionController : ControllerBase
{
    private readonly IServicioTrabajoImpresion servicioTrabajo;

    public TrabajosImpresionController(IServicioTrabajoImpresion servicioTrabajo) => this.servicioTrabajo = servicioTrabajo;

    [Authorize(Policy = "Impresion.Estacion")]
    [HttpPost("estacion/trabajos/reservar")]
    public async Task<ActionResult<IReadOnlyList<TrabajoImpresionReservadoRespuesta>>> Reservar(
        ReservarTrabajosImpresionSolicitud solicitud, CancellationToken tokenCancelacion) =>
        Ok(await servicioTrabajo.ReservarAsync(solicitud.MaximoTrabajos, tokenCancelacion));

    [Authorize(Policy = "Impresion.Estacion")]
    [HttpPost("estacion/trabajos/{idTrabajo:guid}/enviando")]
    public async Task<IActionResult> MarcarEnviando(
        Guid idTrabajo, ReservaTrabajoImpresionSolicitud solicitud, CancellationToken tokenCancelacion)
    {
        await servicioTrabajo.MarcarEnviandoAsync(idTrabajo, solicitud.IdReserva, tokenCancelacion);
        return NoContent();
    }

    [Authorize(Policy = "Impresion.Estacion")]
    [HttpPost("estacion/trabajos/{idTrabajo:guid}/renovar-reserva")]
    public async Task<IActionResult> RenovarReserva(
        Guid idTrabajo, ReservaTrabajoImpresionSolicitud solicitud, CancellationToken tokenCancelacion)
    {
        await servicioTrabajo.RenovarReservaAsync(idTrabajo, solicitud.IdReserva, tokenCancelacion);
        return NoContent();
    }

    [Authorize(Policy = "Impresion.Estacion")]
    [HttpPost("estacion/trabajos/{idTrabajo:guid}/aceptado-por-cola")]
    public async Task<IActionResult> MarcarAceptadoPorCola(
        Guid idTrabajo, ReservaTrabajoImpresionSolicitud solicitud, CancellationToken tokenCancelacion)
    {
        await servicioTrabajo.MarcarAceptadoPorColaAsync(idTrabajo, solicitud.IdReserva, tokenCancelacion);
        return NoContent();
    }

    [Authorize(Policy = "Impresion.Estacion")]
    [HttpPost("estacion/trabajos/{idTrabajo:guid}/fallido")]
    public async Task<IActionResult> MarcarFallido(
        Guid idTrabajo, FallarTrabajoImpresionSolicitud solicitud, CancellationToken tokenCancelacion)
    {
        await servicioTrabajo.MarcarFallidoAsync(idTrabajo, solicitud, tokenCancelacion);
        return NoContent();
    }

    [Authorize(Policy = "Impresion.Usar")]
    [HttpGet("solicitudes/{idSolicitud:guid}")]
    public async Task<ActionResult<IReadOnlyList<ResumenTrabajoImpresionRespuesta>>> ObtenerPorSolicitud(
        Guid idSolicitud, CancellationToken tokenCancelacion) =>
        Ok(await servicioTrabajo.ObtenerPorSolicitudAsync(idSolicitud, tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpGet("trabajos")]
    public async Task<ActionResult<IReadOnlyList<ResumenTrabajoImpresionRespuesta>>> Consultar(
        [FromQuery] ConsultaTrabajosImpresion consulta, CancellationToken tokenCancelacion) =>
        Ok(await servicioTrabajo.ConsultarAsync(consulta, tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpPost("trabajos/{idTrabajo:guid}/reintentar")]
    public async Task<ActionResult<ResumenTrabajoImpresionRespuesta>> Reintentar(
        Guid idTrabajo, ReintentarTrabajoImpresionSolicitud solicitud, CancellationToken tokenCancelacion) =>
        Ok(await servicioTrabajo.ReintentarAsync(idTrabajo, solicitud.Motivo, tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpPost("trabajos/{idTrabajo:guid}/cancelar")]
    public async Task<IActionResult> Cancelar(
        Guid idTrabajo, CancelarTrabajoImpresionSolicitud solicitud, CancellationToken tokenCancelacion)
    {
        await servicioTrabajo.CancelarAsync(idTrabajo, solicitud.Motivo, tokenCancelacion);
        return NoContent();
    }

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpGet("panel")]
    public async Task<ActionResult<PanelImpresionRespuesta>> ObtenerPanel(CancellationToken tokenCancelacion) =>
        Ok(await servicioTrabajo.ObtenerPanelAsync(tokenCancelacion));
}
