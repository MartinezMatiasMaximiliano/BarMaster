using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;
using System.Runtime.ConstrainedExecution;

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
            try
            {
                var result = await _cuentasCorrientesServices.GetListaCuentasCorrientes();
                var response = result.Select(cc => new
                {
                    Id = cc.Id,
                    Nombre = cc.Nombre,
                    Telefono = cc.Telefono,
                    Domicilio = cc.Domicilo,
                    Balance = cc.Balance,
                    Descuento = cc.Descuento,
                    Movimientos = cc.Movimientos.Select(m => new
                    {
                        IdMovimimientoCaja = m.MovimientoCaja.Id,
                        Descripcion = m.MovimientoCaja.Descripcion,
                        Monto = m.MovimientoCaja.Monto,
                        FechaMovimiento = m.MovimientoCaja.FechaMovimiento
                    }).ToList()
                });
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {

                    default:
                        return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error al obtener las cuentas corrientes." });
                }

            }
        }

        [HttpGet("{IdCuenta}")]
        public async Task<IActionResult> GetCuentaCorrientePorId(Guid IdCuenta)
        {
            try
            {
                var result = await _cuentasCorrientesServices.GetCuentaCorrientePorId(IdCuenta);
                var response = new
                {
                    Id = result.Id,
                    Nombre = result.Nombre,
                    Telefono = result.Telefono,
                    Domicilio = result.Domicilo,
                    Balance = result.Balance,
                    Descuento = result.Descuento,
                    Movimientos = result.Movimientos.Select(m => new
                    {
                        IdMovimimientoCaja = m.MovimientoCaja.Id,
                        Descripcion = m.MovimientoCaja.Descripcion,
                        Monto = m.MovimientoCaja.Monto,
                        FechaMovimiento = m.MovimientoCaja.FechaMovimiento,
                        EsIngreso = m.MovimientoCaja.TipoMovimientoCaja?.EsIngreso ?? false,
                        EsEfectivo = m.MovimientoCaja.TipoMovimientoCaja?.EsEfectivo ?? false
                    })
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "No se encontro la cuenta":
                        return NotFound(new { message = "No se encontró la cuenta corriente." });
                    default:
                        return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error al obtener las cuentas corrientes." });
                }

            }
        }

        [HttpPost("Crear")]
        public async Task<IActionResult> CrearCuentaCorriente([FromBody] CrearCuentaCorrienteDTO request)
        {
            try
            {
                if (request.Nombre == null || request.Telefono == null || request.Domicilio == null) return BadRequest(new { message = "Todos los campos son obligatorios." });

                var result = await _cuentasCorrientesServices.CrearCuentaCorriente(request);
                if (result == null) return BadRequest(new { message = "No se pudo crear la cuenta corriente." });
                //TODO: mapear a DTO?
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no encontrada":
                        return BadRequest(new { message = "No se pudo identificar la sucursal del usuario." });
                    default:
                        return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error al crear la cuenta corriente." });
                }
            }
        }

        [HttpPost("Modificar")]
        public async Task<IActionResult> ActualizarDatosCuentaCorriente([FromBody] ModificarCuentaCorrienteDTO request)
        {
            try
            {
                if (request.IdCuenta == Guid.Empty) throw new Exception("Cuenta corriente no encontrada");
                var result = await _cuentasCorrientesServices.ActualizarDatosCuentaCorriente(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Cuenta corriente no encontrada":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Cuenta corriente no encontrada"));
                    default:
                        return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al actualizar la cuenta corriente.");
                }
            }

        }

        [HttpPost("CrearMovimiento")]
        public async Task<IActionResult> CrearMovimientoCuentaCorriente([FromQuery] Guid IdCuenta, [FromBody] CrearMovimientoCajaDTO request)
        {
            try
            {
                if (request.IdCaja == Guid.Empty || request.IdTipoMovimientoCaja == 0) throw new Exception("Todos los campos son obligatorios");
                if (request.Monto <= 0) throw new Exception("y el monto debe ser mayor a cero.");
                if (IdCuenta == Guid.Empty) throw new Exception("id vacio");
                var result = await _cuentasCorrientesServices.CrearMovimientoCuentaCorriente(IdCuenta, request);
                CuentaCorrienteDTO response = new CuentaCorrienteDTO
                {
                    Id = result.Id,
                    Nombre = result.Nombre,
                    Telefono = result.Telefono,
                    Domicilo = result.Domicilo,
                    Balance = result.Balance,
                    Descuento = result.Descuento,
                    Movimientos = result.Movimientos.Select(m => new MovimientoCuentaCorrienteDTO
                    {
                        IdMovimientoCaja = m.MovimientoCaja.Id,
                        Descripcion = m.MovimientoCaja.Descripcion,
                        Monto = m.MovimientoCaja.Monto,
                        FechaMovimiento = m.MovimientoCaja.FechaMovimiento,
                        EsIngreso = m.MovimientoCaja.TipoMovimientoCaja?.EsIngreso ?? false,
                        EsEfectivo = m.MovimientoCaja.TipoMovimientoCaja?.EsEfectivo ?? false
                    }).ToList()
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Todos los campos son obligatorios":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "Todos los campos son obligatorios y el monto debe ser mayor a cero."));
                    case "el monto debe ser mayor a cero.":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El monto del movimiento debe ser mayor a cero."));
                    case "id vacio":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El Id de la cuenta corriente es obligatorio."));
                    case "No se encontro la cuenta":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", "No se pudo encontrar la cuenta corriente."));
                    default:
                        return StatusCode(500, "Ocurrió un error al crear el movimiento de la cuenta corriente.");
                }

            }
        }

        [HttpDelete]
        public async Task<IActionResult> EliminarCuentaCorriente([FromQuery] Guid IdCuenta)
        {
            try
            {
                var result = await _cuentasCorrientesServices.EliminarCuentaCorriente(IdCuenta);
                return Ok("Cuenta corriente eliminada");
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Cuenta corriente no encontrada":
                        return BadRequest(new { message = "No se encontró la cuenta corriente a eliminar." });
                    case "balance no nulo":
                        return BadRequest(new { message = "No se puede eliminar la cuenta corriente porque tiene balance impago" });
                    default:
                        return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error al eliminar la cuenta corriente." });
                }

            }
        }
    }

}
