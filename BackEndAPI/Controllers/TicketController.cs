using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly IMovimientosCajaServices _movimientosCajaServices;

        public TicketController(IMovimientosCajaServices movimientosCajaServices)
        {
            _movimientosCajaServices = movimientosCajaServices;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTicket(Guid id)
        {
            try
            {
                var movimiento = await _movimientosCajaServices.BuscarTicketCompleto(id);

                var productosDelTicket = movimiento.Visita?.Productos?
                    .Where(p => p.IdMovimientoCaja == movimiento.Id)
                    .Select(p => new TicketVirtualProductoDTO
                    {
                        Nombre = p.NombreProducto,
                        Precio = p.PrecioDelMomento
                    })
                    .ToList() ?? new List<TicketVirtualProductoDTO>();

                var mozo = movimiento.Visita?.Mozo;

                var ticket = new TicketVirtualDTO
                {
                    Id = movimiento.Id,
                    Monto = movimiento.Monto,
                    FechaMovimiento = movimiento.FechaMovimiento,
                    NombreMesa = movimiento.Visita?.Mesa?.Nombre,
                    NombreSucursal = movimiento.Caja?.Sucursal?.Nombre,
                    NombreMozo = mozo != null ? $"{mozo.Nombres} {mozo.Apellido}" : null,
                    TipoPago = movimiento.TipoMovimientoCaja?.Nombre,
                    Productos = productosDelTicket
                };

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El ticket no existe":
                        return NotFound(ex.Message);
                    default:
                        return StatusCode(500, "Error interno de servidor");
                }
            }
        }
    }
}
