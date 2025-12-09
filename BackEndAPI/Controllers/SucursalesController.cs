using BackEndAPI.DTOs.Request;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SucursalesController : ControllerBase
    {
        private readonly ISucursalesServices _sucursalesServices;
        public SucursalesController(ISucursalesServices sucursalesServices)
        {
            _sucursalesServices = sucursalesServices;
        }

        [HttpPost("/Sucursal")]
        public async Task<IActionResult> CrearSucursal([FromBody] CrearSucursalDTO request)
        {
            try
            {
                var result = await _sucursalesServices.CrearSucursal(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                    {
                    case "Sucursal ya existe":
                        return BadRequest("Sucursal ya existe");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }
    }
}
