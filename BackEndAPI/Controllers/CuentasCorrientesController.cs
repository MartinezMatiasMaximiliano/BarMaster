using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("/[controller]")]
    [ApiController]
    public class CuentasCorrientesController : ControllerBase
    {
        private readonly ICuentasCorrientesServices _cuentasCorrientesServices;
        public CuentasCorrientesController(ICuentasCorrientesServices cuentasCorrientesServices)
        {
            _cuentasCorrientesServices = cuentasCorrientesServices;
        } 

        [HttpGet]
        public async Task<IActionResult> GetListaCuentasCorrientes()
        {
            var result = await _cuentasCorrientesServices.GetListaCuentasCorrientes();
            return Ok(result.Select(MapearCuentaCorriente).ToList());
        }

        [HttpGet("{IdCuenta}")]
        public async Task<IActionResult> GetCuentaCorrientePorId(Guid IdCuenta)
        {
            var result = await _cuentasCorrientesServices.GetCuentaCorrientePorId(IdCuenta);
            return Ok(MapearCuentaCorriente(result!));
        }

        [HttpPost("Crear")]
        public async Task<IActionResult> CrearCuentaCorriente([FromBody] CrearCuentaCorrienteDTO request)
        {
            var result = await _cuentasCorrientesServices.CrearCuentaCorriente(request);
            //TODO: mapear a DTO?
            return Ok(result);
        }

        [HttpPost("Modificar")]
        public async Task<IActionResult> ActualizarDatosCuentaCorriente([FromBody] ModificarCuentaCorrienteDTO request)
        {
            var result = await _cuentasCorrientesServices.ActualizarDatosCuentaCorriente(request);
            return Ok(result);
        }

        [HttpPost("CrearMovimiento")]
        public async Task<IActionResult> CrearMovimientoCuentaCorriente([FromQuery] Guid IdCuenta, [FromBody] CrearMovimientoCajaDTO request)
        {
            var idSucursal = ObtenerIdSucursal();
            var result = await _cuentasCorrientesServices.CrearMovimientoCuentaCorriente(idSucursal, IdCuenta, request);
            return Ok(MapearCuentaCorriente(result!));
        }

        [HttpPatch("Desactivar")]
        public async Task<IActionResult> DesactivarCuentaCorriente([FromQuery] Guid IdCuenta)
        {
            await _cuentasCorrientesServices.DesactivarCuentaCorriente(IdCuenta);
            return Ok(new EntregaDTO(200, "OK", "Cuenta corriente desactivada"));
        }

        [HttpDelete("Eliminar")]
        public async Task<IActionResult> EliminarCuentaCorriente([FromQuery] Guid IdCuenta)
        {
            await _cuentasCorrientesServices.EliminarCuentaCorriente(IdCuenta);
            return Ok(new EntregaDTO(200, "DELETED", "Cuenta corriente eliminada"));
        }

        private Guid ObtenerIdSucursal()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")?.Value;
            if (!Guid.TryParse(claim, out var idSucursal) || idSucursal == Guid.Empty)
                throw new BusinessRuleException("Sucursal no identificada");
            return idSucursal;
        }

        private static CuentaCorrienteDTO MapearCuentaCorriente(CuentaCorriente cuenta) => new CuentaCorrienteDTO
        {
            Id = cuenta.Id,
            Nombre = cuenta.Nombre,
            Telefono = cuenta.Telefono,
            Domicilio = cuenta.Domicilo,
            Balance = cuenta.Balance,
            Descuento = cuenta.Descuento,
            Movimientos = cuenta.Movimientos.Select(MapearMovimiento).ToList()
        };

        private static MovimientoCuentaCorrienteDTO MapearMovimiento(MovimientosCuentaCorriente movimiento) => new MovimientoCuentaCorrienteDTO
        {
            IdMovimientoCaja = movimiento.MovimientoCaja.Id,
            Descripcion = movimiento.MovimientoCaja.Descripcion,
            MontoAbonado = movimiento.MovimientoCaja.MontoAbonado,
            Vuelto = movimiento.MovimientoCaja.Vuelto,
            MontoTotal = movimiento.MovimientoCaja.MontoTotal,
            FechaMovimiento = movimiento.MovimientoCaja.FechaMovimiento,
            EsIngreso = movimiento.MovimientoCaja.TipoMovimientoCaja?.EsIngreso ?? false,
            EsEfectivo = movimiento.MovimientoCaja.TipoMovimientoCaja?.EsEfectivo ?? false
        };
    }

}
