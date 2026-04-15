using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Configuration;
using System.Linq;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class CajasController : ControllerBase
    {
        private readonly ICajasServices _cajasServices;
        public CajasController(ICajasServices cajasServices)
        {
            _cajasServices = cajasServices;
        }

        [HttpGet("/Cajas")]
        public async Task<IActionResult> GetListaCajas()
        {
            try
            {
                var cajas = await _cajasServices.BuscarListaCajas();
                var listaCajas = cajas.Select(caja => new CajaDTO
                {
                    Id = caja.Id,
                    IdSucursal = caja.IdSucursal,
                    FechaApertura = caja.FechaApertura,
                    FechaCierre = caja.FechaCierre,
                    MontoApertura = caja.MontoApertura,
                    MontoCierre = caja.MontoCierre,
                    Diferencia = caja.Diferencia
                }).ToList();

                if (listaCajas.Count == 0)
                {
                    return NotFound(new { message = "No se encontraron cajas" });
                }

                return Ok(listaCajas);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "No se encontraron cajas":
                        return NotFound(new { message = ex.Message });
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpGet("/Cajas/Activa")]
        public async Task<IActionResult> GetCajaActiva()
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                if (IdSucursal == Guid.Empty)
                {
                    throw new Exception("Sucursal no encontrada");
                }
                var caja = await _cajasServices.BuscarCajaAbiertaPorIdSucursal(IdSucursal);
                
                if (caja == null)
                {
                    return NotFound(new { message = "No hay una caja abierta" });
                }

                var cajaDTO = new CajaDTO
                {
                    Id = caja.Id,
                    IdSucursal = caja.IdSucursal,
                    FechaApertura = caja.FechaApertura,
                    FechaCierre = caja.FechaCierre,
                    MontoApertura = caja.MontoApertura,
                    MontoCierre = caja.MontoCierre,
                    MontoActual = caja.MontoActual,
                    Diferencia = caja.Diferencia
                };
                
                return Ok(cajaDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no encontrada":
                        return NotFound(new { message = ex.Message });
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpGet("/Cajas/{id}")]
        public async Task<IActionResult> GetCajaPorId(Guid id)
        {
            try
            {
                var caja = await _cajasServices.BuscarCajaPorId(id);
                var cajaDTO = new CajaDTO
                {
                    Id = caja.Id,
                    IdSucursal = caja.IdSucursal,
                    FechaApertura = caja.FechaApertura,
                    FechaCierre = caja.FechaCierre,
                    MontoApertura = caja.MontoApertura,
                    MontoCierre = caja.MontoCierre,
                    Diferencia = caja.Diferencia
                };
                return Ok(cajaDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Caja no encontrada":
                        return NotFound(new { message = ex.Message });
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpPost("/Cajas/Abrir")]
        public async Task<IActionResult> AbrirCaja([FromBody] CrearCajaDTO request)
        {
            try
            {
                if (request.MontoApertura < 0)
                {
                    return BadRequest(new { message = "El monto de apertura no puede ser negativo" });
                }

                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;

                if (IdSucursal == Guid.Empty)
                {
                    throw new Exception("Sucursal no encontrada");
                }

                var caja = await _cajasServices.BuscarCajaAbiertaPorIdSucursal(IdSucursal);
                if (caja != null)
                {
                    return BadRequest(new { message = "Ya hay una caja abierta para esta sucursal" });
                }

                var result = await _cajasServices.CrearCaja(request, IdSucursal);
                return Ok(result);

            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no encontrada":
                        return NotFound(new { message = ex.Message });
                    default:
                        return StatusCode(500, new { message = "Error interno del servidor" });
                }   

            }
        }

        [HttpPatch("/Cajas/Cerrar")]
        public async Task<IActionResult> CerrarCaja([FromBody] CerrarCajaDTO request)
        {
            try
            {
                var caja = await _cajasServices.BuscarCajaPorId(request.IdCaja);
                var result = await _cajasServices.CerrarCaja(caja.Id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Caja no encontrada":
                        return NotFound(new { message = ex.Message });
                    case "La caja ya está cerrada":
                        return BadRequest(new { message = ex.Message });
                    default:
                        return StatusCode(500, new { message = "Error interno del servidor" });
                }
            }
        }
    }
}
