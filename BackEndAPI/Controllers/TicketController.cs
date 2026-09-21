using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
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
                    MontoAbonado = movimiento.MontoAbonado,
                    Vuelto = movimiento.Vuelto,
                    MontoTotal = movimiento.MontoTotal,
                    FechaMovimiento = movimiento.FechaMovimiento,
                    NombreMesa = movimiento.Visita?.Mesa?.Numero.ToString(),
                    NombreSucursal = movimiento.Caja?.Sucursal?.Nombre,
                    NombreEmpresa = movimiento.Caja?.Sucursal?.Empresa?.Nombre,
                    NombreMozo = mozo != null ? $"{mozo.Nombres} {mozo.Apellido}" : null,
                    TipoPago = movimiento.TipoMovimientoCaja?.Nombre,
                    Productos = productosDelTicket
                };

            return Ok(ticket);
        }
    }
}
