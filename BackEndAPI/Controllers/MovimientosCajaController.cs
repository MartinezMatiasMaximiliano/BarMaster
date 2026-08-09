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
                        Nombre = movimiento.TipoMovimientoCaja?.Nombre ?? string.Empty,
                        EsIngreso = movimiento.TipoMovimientoCaja?.EsIngreso ?? false,
                        EsEfectivo = movimiento.TipoMovimientoCaja?.EsEfectivo ?? false
                    },
                    IdCaja = movimiento.IdCaja,
                    MontoAbonado = movimiento.MontoAbonado,
                    Vuelto = movimiento.Vuelto,
                    MontoTotal = movimiento.MontoTotal,
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
                        Nombre = movimientoCaja.TipoMovimientoCaja?.Nombre ?? string.Empty,
                        EsIngreso = movimientoCaja.TipoMovimientoCaja?.EsIngreso ?? false,
                        EsEfectivo = movimientoCaja.TipoMovimientoCaja?.EsEfectivo ?? false
                    },
                    IdCaja = movimientoCaja.IdCaja,
                    MontoAbonado = movimientoCaja.MontoAbonado,
                    Vuelto = movimientoCaja.Vuelto,
                    MontoTotal = movimientoCaja.MontoTotal,
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

        [HttpGet("/MovimientosCaja/Caja/{idCaja}")]
        public async Task<IActionResult> GetMovimientoCajaPorCaja(Guid idCaja)
        {
            try
            {
                var movimientosCaja = await _movimientosCajaServices.BuscarMovimientosCajaPorCaja(idCaja);
                var listaMovimientosCaja = movimientosCaja.Select(movimiento => new MovimientoCajaDTO
                {
                    Id = movimiento.Id,
                    TipoMovimientoCaja = new TipoMovimientoCajaDTO
                    {
                        Id = movimiento.IdTipoMovimientoCaja,
                        Nombre = movimiento.TipoMovimientoCaja?.Nombre ?? string.Empty,
                        EsIngreso = movimiento.TipoMovimientoCaja?.EsIngreso ?? false,
                        EsEfectivo = movimiento.TipoMovimientoCaja?.EsEfectivo ?? false
                    },
                    IdCaja = movimiento.IdCaja,
                    MontoAbonado = movimiento.MontoAbonado,
                    Vuelto = movimiento.Vuelto,
                    MontoTotal = movimiento.MontoTotal,
                    Descripcion = movimiento.Descripcion,
                    FechaMovimiento = movimiento.FechaMovimiento
                }).ToList();

                return Ok(listaMovimientosCaja);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "La caja no existe":
                        return NotFound(new { message = ex.Message });
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [Authorize]
        [HttpPost("/MovimientosCaja")]
        public async Task<IActionResult> CrearMovimientoCaja([FromBody] CrearMovimientoCajaDTO request)
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty) throw new Exception("Sucursal no encontrada");
                
                if (request == null || request.IdTipoMovimientoCaja == 0) throw new Exception("Datos de movimiento de caja no proporcionados");
                if (request.MontoAbonado <= 0) throw new Exception("El monto Abonado debe ser mayor a cero");
                var nuevoMovimientoCaja = await _movimientosCajaServices.CrearMovimientoCaja(IdSucursal, request);
               
                var response = new MovimientoCajaDTO
                {
                    Id = nuevoMovimientoCaja.Id,
                    TipoMovimientoCaja = new TipoMovimientoCajaDTO
                    {
                        Id = nuevoMovimientoCaja.IdTipoMovimientoCaja,
                        Nombre = nuevoMovimientoCaja.TipoMovimientoCaja?.Nombre ?? string.Empty,
                        EsIngreso = nuevoMovimientoCaja.TipoMovimientoCaja?.EsIngreso ?? false,
                        EsEfectivo = nuevoMovimientoCaja.TipoMovimientoCaja?.EsEfectivo ?? false
                    },
                    IdCaja = nuevoMovimientoCaja.IdCaja,
                    MontoAbonado = nuevoMovimientoCaja.MontoAbonado,
                    Vuelto = nuevoMovimientoCaja.Vuelto,
                    MontoTotal = nuevoMovimientoCaja.MontoTotal,
                    Descripcion = nuevoMovimientoCaja.Descripcion,
                    FechaMovimiento = nuevoMovimientoCaja.FechaMovimiento
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El monto debe ser mayor a cero":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El monto debe ser mayor a cero"));
                    case "Datos de movimiento de caja no proporcionados":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Datos de movimiento de caja no proporcionados"));
                    case "La caja no existe":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "La caja no existe"));
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

