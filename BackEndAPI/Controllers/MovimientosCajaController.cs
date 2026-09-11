using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            var movimientosCaja = await _movimientosCajaServices.BuscarListaMovimientosCaja();
            return Ok(movimientosCaja.Select(MapearMovimiento).ToList());
        }

        [HttpGet("/MovimientosCaja/{id}")]
        public async Task<IActionResult> GetMovimientoCajaPorId(Guid id)
        {
            var movimientoCaja = await _movimientosCajaServices.BuscarMovimientoCajaPorId(id);
            return Ok(MapearMovimiento(movimientoCaja));
        }

        [HttpGet("/MovimientosCaja/Caja/{idCaja}")]
        public async Task<IActionResult> GetMovimientoCajaPorCaja(Guid idCaja)
        {
            var movimientosCaja = await _movimientosCajaServices.BuscarMovimientosCajaPorCaja(idCaja);
            return Ok(movimientosCaja.Select(MapearMovimiento).ToList());
        }

        [HttpPost("/MovimientosCaja")]
        public async Task<IActionResult> CrearMovimientoCaja([FromBody] CrearMovimientoCajaDTO request)
        {
            var idSucursal = ObtenerIdSucursal();
            var nuevoMovimientoCaja = await _movimientosCajaServices.CrearMovimientoCaja(idSucursal, request);
            return Ok(MapearMovimiento(nuevoMovimientoCaja));
        }

        [HttpDelete("/MovimientosCaja/{id}")]
        public async Task<IActionResult> EliminarMovimientoCaja(Guid id)
        {
            await _movimientosCajaServices.EliminarMovimientoCaja(id);
            return Ok(new EntregaDTO(200, "DELETED", "Movimiento de caja eliminado exitosamente"));
        }

        private Guid ObtenerIdSucursal()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")?.Value;
            if (!Guid.TryParse(claim, out var idSucursal) || idSucursal == Guid.Empty)
                throw new BusinessRuleException("Sucursal no identificada");
            return idSucursal;
        }

        private static MovimientoCajaDTO MapearMovimiento(MovimientoCaja movimiento) => new MovimientoCajaDTO
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
        };
    }
}
