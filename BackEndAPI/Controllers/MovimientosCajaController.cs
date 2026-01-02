using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class MovimientosCajaController : ControllerBase
    {
        private readonly IMovimientosCajaServices _movimientosCajaServices;

        public MovimientosCajaController(IMovimientosCajaServices movimientosCajaServices)
        {
            _movimientosCajaServices = movimientosCajaServices;
        }

        [HttpGet("/MovimientosCaja")]
        public async Task<IActionResult> GetListaMovimientosCaja()
        {
            try
            {
                var movimientosCaja = await _movimientosCajaServices.BuscarListaMovimientosCaja();
                var listaMovimientosCaja = movimientosCaja.Select(movimiento => new MovimientoCajaDTO
                {
                    Id = movimiento.Id,
                    TipoMovimientoCaja = new TipoMovimientoCajaDTO
                    {
                        Id = movimiento.IdTipoMovimientoCaja,
                        Nombre = movimiento.TipoMovimientoCaja?.Nombre ?? string.Empty
                    },
                    IdCaja = movimiento.IdCaja,
                    Monto = movimiento.Monto,
                    Descripcion = movimiento.Descripcion,
                    FechaMovimiento = movimiento.FechaMovimiento
                }).ToList();

                return Ok(listaMovimientosCaja);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
            }
        }

        [HttpGet("/MovimientosCaja/{id}")]
        public async Task<IActionResult> GetMovimientoCajaPorId(Guid id)
        {
            try
            {
                var movimientoCaja = await _movimientosCajaServices.BuscarMovimientoCajaPorId(id);
                var movimientoCajaDTO = new MovimientoCajaDTO
                {
                    Id = movimientoCaja.Id,
                    TipoMovimientoCaja = new TipoMovimientoCajaDTO
                    {
                        Id = movimientoCaja.IdTipoMovimientoCaja,
                        Nombre = movimientoCaja.TipoMovimientoCaja?.Nombre ?? string.Empty
                    },
                    IdCaja = movimientoCaja.IdCaja,
                    Monto = movimientoCaja.Monto,
                    Descripcion = movimientoCaja.Descripcion,
                    FechaMovimiento = movimientoCaja.FechaMovimiento
                };
                return Ok(movimientoCajaDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El movimiento de caja no existe":
                        return NotFound(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor");
                }
            }
        }

        [HttpPost("/MovimientosCaja")]
        public async Task<IActionResult> CrearMovimientoCaja([FromBody] CrearMovimientoCajaDTO request)
        {
            try
            {
                var nuevoMovimientoCaja = await _movimientosCajaServices.CrearMovimientoCaja(request);
                // Recargar con relaciones para obtener el nombre del tipo
                var movimientoCajaCompleto = await _movimientosCajaServices.BuscarMovimientoCajaPorId(nuevoMovimientoCaja.Id);
                var movimientoCajaDTO = new MovimientoCajaDTO
                {
                    Id = movimientoCajaCompleto.Id,
                    TipoMovimientoCaja = new TipoMovimientoCajaDTO
                    {
                        Id = movimientoCajaCompleto.IdTipoMovimientoCaja,
                        Nombre = movimientoCajaCompleto.TipoMovimientoCaja?.Nombre ?? string.Empty
                    },
                    IdCaja = movimientoCajaCompleto.IdCaja,
                    Monto = movimientoCajaCompleto.Monto,
                    Descripcion = movimientoCajaCompleto.Descripcion,
                    FechaMovimiento = movimientoCajaCompleto.FechaMovimiento
                };
                return Ok(movimientoCajaDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "La caja no existe":
                        return BadRequest(ex.Message);
                    case "El monto debe ser mayor a 0":
                        return BadRequest(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor");
                }
            }
        }

        [HttpDelete("/MovimientosCaja/{id}")]
        public async Task<IActionResult> EliminarMovimientoCaja(Guid id)
        {
            try
            {
                await _movimientosCajaServices.EliminarMovimientoCaja(id);
                return Ok(new EntregaDTO(200, "DELETED", "Movimiento de caja eliminado exitosamente"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El movimiento de caja no existe":
                        return NotFound(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor");
                }
            }
        }
    }
}

