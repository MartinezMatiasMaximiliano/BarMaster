using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Operations;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class SucursalesController : ControllerBase
    {
        private readonly ISucursalesServices _sucursalesServices;
        private readonly JWTServices _jWTServices;

        public SucursalesController(ISucursalesServices sucursalesServices, JWTServices jWTServices)
        {
            _sucursalesServices = sucursalesServices;
            _jWTServices = jWTServices;
        }


        [HttpGet("/Sucursal")]
        public async Task<IActionResult> BuscarSucursal()
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;

                var result = await _sucursalesServices.BuscarSucursalPorId(IdSucursal);

                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no encontrada":
                        return BadRequest("Sucursal no encontrada");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpPost("/Sucursal")]
        public async Task<IActionResult> CrearSucursal([FromBody] CrearSucursalDTO request)
        {
            try
            {
                var IdEmpresa = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa")!.Value) : Guid.Empty;

                if (IdEmpresa == Guid.Empty)
                {
                    throw new Exception("Empresa no identificada");
                }

                var result = await _sucursalesServices.CrearSucursal(request, IdEmpresa);
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Empresa no identificada":
                        return BadRequest("Empresa no identificada");
                    case "Sucursal ya existe":
                        return BadRequest("Sucursal ya existe");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpPatch("/Sucursal")]
        public async Task<IActionResult> EditarSucursal([FromBody] ModificarSucursalDTO request)
        {
            try
            {
                var IdSucursal = User.Claims.FirstOrDefault(c => c.Type == "IdSucursal") != null ? Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == "IdSucursal")!.Value) : Guid.Empty;
                var result = await _sucursalesServices.ActualizarSucursal(IdSucursal,request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no encontrada":
                        return BadRequest("Sucursal no encontrada");
                    case "Sucursal ya existe":
                        return BadRequest("Sucursal ya existe");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        } 
    }
}
