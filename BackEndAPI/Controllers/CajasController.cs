using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Configuration;

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

        //public async Task<IActionResult> GetCajas()
        //{
        //    var result = await _cajasServices.GetCajas();
        //    return Ok();
        //}

        //public async Task<IActionResult> GetCajaById(int id)
        //{
        //    var result = await _cajasServices.GetCajaById(id);
        //    return Ok(result);
        //}

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
