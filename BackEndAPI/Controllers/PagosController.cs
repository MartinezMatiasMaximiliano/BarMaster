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

        [HttpPost("/Pagar")]
        public async Task<IActionResult> PagarItemsDeVisita([FromBody] CrearPagoDTO request, [FromQuery] bool emitirFactura, [FromQuery] bool marcarPago)
        {
            try
            {
                if (request.ListaIdsProductos == null || request.ListaIdsProductos.Count <= 0) throw new Exception("Lista de ids vacia");
                if (request.IdVisita == Guid.Empty) throw new Exception("IdVisita vacio");


                var result = await _PagosServices.PagarProductos(request,emitirFactura,marcarPago);
                var Response = new PagoDTO
                {
                    Id = result.Id,
                    IdVisita = result.IdVisita ?? Guid.Empty,
                    FechaCreacion = result.FechaMovimiento,
                    Monto = result.Monto,
                    tipoMovimientoCaja = result.TipoMovimientoCaja
                };  
                return Ok(Response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Monto insuficiente":
                        return BadRequest("El monto proporcionado es insuficiente para cubrir el costo de los productos.");
                    case "Producto ya pagado":
                        return BadRequest("Uno o más productos seleccionados ya fueron pagados.");
                    default:
                        return StatusCode(500, "Internal server error catch: Pagar items de visita - " + ex.Message);
                }
            }
        }

    }
}
