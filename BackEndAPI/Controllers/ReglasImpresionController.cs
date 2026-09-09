using BackEndAPI.Impresion.Reglas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers;

[ApiController]
[Authorize(Policy = "Impresion.Configurar")]
[Route("impresion/reglas")]
public sealed class ReglasImpresionController : ControllerBase
{
    private readonly IServicioReglaImpresion servicioRegla;

    public ReglasImpresionController(IServicioReglaImpresion servicioRegla) => this.servicioRegla = servicioRegla;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReglaImpresionRespuesta>>> ObtenerTodas(CancellationToken tokenCancelacion) =>
        Ok(await servicioRegla.ObtenerTodasAsync(tokenCancelacion));

    [HttpPut]
    public async Task<ActionResult<ReglaImpresionRespuesta>> Guardar(
        GuardarReglaImpresionSolicitud solicitud, CancellationToken tokenCancelacion) =>
        Ok(await servicioRegla.GuardarAsync(solicitud, tokenCancelacion));

    [HttpDelete("{idRegla:guid}")]
    public async Task<IActionResult> Eliminar(Guid idRegla, CancellationToken tokenCancelacion)
    {
        await servicioRegla.EliminarAsync(idRegla, tokenCancelacion);
        return NoContent();
    }

    [HttpPost("validar")]
    public async Task<ActionResult<ValidacionConfiguracionImpresionRespuesta>> Validar(CancellationToken tokenCancelacion) =>
        Ok(await servicioRegla.ValidarAsync(tokenCancelacion));
}
