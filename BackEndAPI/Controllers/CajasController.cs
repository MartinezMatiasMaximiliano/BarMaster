using BackEndAPI.DTOs.Request.Crear;
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

                return Ok(listaCajas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
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

        [HttpPost("/Caja")]
        public async Task<IActionResult> AbrirCaja([FromBody] CrearCajaDTO request)
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;

                if (IdSucursal == Guid.Empty)
                {
                    throw new Exception("Sucursal no encontrada");
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

        [HttpPatch("/Caja")]
        public async Task<IActionResult> CerrarCaja([FromBody] Guid IdCaja)
        {
            try
            {
                var result = await _cajasServices.CerrarCaja(IdCaja);
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
