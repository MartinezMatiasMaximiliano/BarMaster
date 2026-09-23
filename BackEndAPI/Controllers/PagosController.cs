using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class PagosController : ControllerBase
    {
        private readonly IPagosServices _PagosServices;
        public PagosController(IPagosServices pagosServices)
        {
            _PagosServices = pagosServices;
        }

        [HttpPost("/Pagar")]
        [Authorize(Policy = "Mesas.Operar")]
        public async Task<IActionResult> PagarItemsDeVisita([FromBody] CrearPagoDTO request)
        {
            var (movimientoCaja, facturaElectronica) = await _PagosServices.PagarProductos(request);

            //TODO: agregar los datos de la factura al response si se generó una factura
            var Response = new PagoDTO
            {
                Id = movimientoCaja.Id,
                IdVisita = movimientoCaja.IdVisita ?? Guid.Empty,
                FechaCreacion = movimientoCaja.FechaMovimiento,
                MontoAbonado = movimientoCaja.MontoAbonado,
                Vuelto = movimientoCaja.Vuelto,
                MontoTotal = movimientoCaja.MontoTotal,
                tipoMovimientoCaja = movimientoCaja.TipoMovimientoCaja
            };
            return Ok(Response);
        }

    }
}
