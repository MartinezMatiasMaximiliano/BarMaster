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
        public PagosController(IPagosServices pagosServices)
        {
            _PagosServices = pagosServices;
        }

        [HttpPost("/Pagar")]
        public async Task<IActionResult> PagarItemsDeVisita([FromBody] CrearPagoDTO request)
        {
            try
            {
                if (request.ListaIdsProductos == null || request.ListaIdsProductos.Count <= 0) throw new Exception("Lista de ids vacia");
                if (request.IdVisita == Guid.Empty) throw new Exception("IdVisita vacio");
                if (request.MontoAbonado <= 0) throw new Exception("Monto abonado inválido");
                if (request.GenerarFactura && request.DatosFacturaARCA == null) throw new Exception("Datos de factura vacios");


                var (movimientoCaja, facturaElectronica) = await _PagosServices.PagarProductos(request);

                //TODO: agregar los datos de la factura al response si se generó una factura
                var Response = new PagoDTO
                {
                    Id = movimientoCaja.Id,
                    IdVisita = movimientoCaja.IdVisita ?? Guid.Empty,
                    FechaCreacion = movimientoCaja.FechaMovimiento,
                    Monto = movimientoCaja.Monto,
                    tipoMovimientoCaja = movimientoCaja.TipoMovimientoCaja
                };
                return Ok(Response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "No se encontró la ubicación del certificado de la empresa":
                        return BadRequest("No se encontró l2a ubicación del certificado de la empresa.");
                    case "IdVisita vacio":
                        return BadRequest("El id de la visita no puede estar vacío.");
                    case "Datos de factura vacios":
                        return BadRequest("Los datos de la factura no pueden estar vacíos si se solicita generar una factura.");
                    case "Lista de ids vacia":
                        return BadRequest("La lista de ids de productos no puede estar vacía.");
                    case "monto abonado inválido":
                        return BadRequest("El monto abonado debe ser mayor a cero.");
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
