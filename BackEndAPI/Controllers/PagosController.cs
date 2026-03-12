using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PagosController : ControllerBase
    {
        private readonly IPagosServices _PagosServices;
        private readonly IVisitasServices _visitasServices;
        public PagosController(IPagosServices pagosServices, IVisitasServices visitasServices)
        {
            _PagosServices = pagosServices;
            _visitasServices = visitasServices;
        }

        [HttpPost("/PagarItems")]
        public async Task<IActionResult> PagarItemsDeVisita([FromBody] CrearPagoDTO request)
        {
            try
            {
                var visitaActualizada = await _PagosServices.PagarProductos(request);
                //TODO: terminar esta funcion, se necesita crear la factura
                var Response = new PagoDTO
                {
                    Id = visitaActualizada.Id,
                    IdVisita = visitaActualizada.IdVisita ?? Guid.Empty,
                    FechaCreacion = visitaActualizada.FechaMovimiento,
                    Monto = visitaActualizada.Monto,
                    tipoMovimientoCaja = visitaActualizada.TipoMovimientoCaja
                };  
                return Ok(Response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Monto insuficiente":
                        return BadRequest("El monto proporcionado es insuficiente para cubrir el costo de los productos.");
                    default:
                        return StatusCode(500, "Internal server error catch: Pagar items de visita - " + ex.Message);
                }
            }
        }

    }
}
