using BackEndAPI.Impresion.Documentos;
using BackEndAPI.Impresion.Trabajos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers;

[ApiController]
[Route("api/impresion/solicitudes")]
public sealed class SolicitudesImpresionController : ControllerBase
{
    private readonly IServicioDocumentoImpresion servicioDocumento;

    public SolicitudesImpresionController(IServicioDocumentoImpresion servicioDocumento) => this.servicioDocumento = servicioDocumento;

    [Authorize(Policy = "Impresion.Usar")]
    [HttpPost("preticket")]
    public async Task<ActionResult<CrearSolicitudImpresionRespuesta>> Preticket(
        ImprimirPreticketSolicitud solicitud,
        CancellationToken tokenCancelacion)
    {
        var respuesta = await servicioDocumento.SolicitarPreticketAsync(solicitud, tokenCancelacion);
        return AcceptedAtAction(nameof(TrabajosImpresionController.ObtenerPorSolicitud), "TrabajosImpresion", new { idSolicitud = respuesta.IdSolicitud }, respuesta);
    }
}
