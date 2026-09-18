using BackEndAPI.Impresion.Dispositivos;
using BackEndAPI.Impresion.Trabajos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers;

[ApiController]
[Route("impresion")]
[ApiExplorerSettings(IgnoreApi = true)]
public sealed class ImpresorasController : ControllerBase
{
    private readonly IServicioImpresora servicio;
    private readonly IServicioTrabajoImpresion servicioTrabajos;

    public ImpresorasController(IServicioImpresora servicio, IServicioTrabajoImpresion servicioTrabajos)
    {
        this.servicio = servicio;
        this.servicioTrabajos = servicioTrabajos;
    }

    [Authorize(Policy = "Impresion.Estacion")]
    [HttpPut("estaciones/{idEstacion:guid}/impresoras/sincronizar")]
    public async Task<ActionResult<IReadOnlyList<ImpresoraRespuesta>>> Sincronizar(
        Guid idEstacion, SincronizarInventarioImpresorasSolicitud solicitud, CancellationToken tokenCancelacion) =>
        Ok(await servicio.SincronizarAsync(idEstacion, solicitud, tokenCancelacion));

    [Authorize(Policy = "Impresion.Estacion")]
    [HttpGet("estaciones/{idEstacion:guid}/impresoras")]
    public async Task<ActionResult<IReadOnlyList<ImpresoraRespuesta>>> ObtenerParaEstacion(
        Guid idEstacion, CancellationToken tokenCancelacion) =>
        Ok(await servicio.ObtenerParaEstacionAsync(idEstacion, tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpGet("impresoras")]
    public async Task<ActionResult<IReadOnlyList<ImpresoraRespuesta>>> ObtenerParaSucursal(CancellationToken tokenCancelacion) =>
        Ok(await servicio.ObtenerParaSucursalAsync(tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpPatch("impresoras/{idImpresora:guid}")]
    public async Task<ActionResult<ImpresoraRespuesta>> Actualizar(
        Guid idImpresora, ActualizarImpresoraSolicitud solicitud, CancellationToken tokenCancelacion) =>
        Ok(await servicio.ActualizarAsync(idImpresora, solicitud, tokenCancelacion));

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpDelete("impresoras/{idImpresora:guid}")]
    public async Task<IActionResult> Eliminar(Guid idImpresora, CancellationToken tokenCancelacion)
    {
        await servicio.EliminarAsync(idImpresora, tokenCancelacion);
        return NoContent();
    }

    [Authorize(Policy = "Impresion.Configurar")]
    [HttpPost("impresoras/{idImpresora:guid}/trabajos-prueba")]
    public async Task<ActionResult<ResumenTrabajoImpresionRespuesta>> Probar(
        Guid idImpresora, CancellationToken tokenCancelacion) =>
        Accepted(await servicioTrabajos.CrearPruebaImpresoraAsync(idImpresora, tokenCancelacion));
}
