using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
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

                var sucursal = await _sucursalesServices.BuscarSucursalPorId(IdSucursal);

                if (sucursal == null)
                {
                    return NotFound(new ErrorDTO(404, "NOT FOUND", "Sucursal no encontrada"));
                }

                // Mapear a DTO para evitar referencias circulares
                var response = new SucursalDTO
                {
                    Id = sucursal.Id,
                    IdEmpresa = sucursal.IdEmpresa,
                    Nombre = sucursal.Nombre,
                    Direccion = sucursal.Direccion,
                    Telefono = sucursal.Telefono,
                    Username = sucursal.Username,
                    Menus = sucursal.Menus?.Select(m => new MenuDTO
                    {
                        Id = m.Id,
                        IdSucursal = m.IdSucursal,
                        Nombre = m.Nombre,
                        Activo = m.Activo
                    }).ToList(),
                    Planos = sucursal.Planos?.Select(p => new PlanoDTO
                    {
                        Id = p.Id,
                        IdSucursal = p.IdSucursal,
                        Nombre = p.Nombre,
                        Detalles = p.Detalles
                    }).ToList(),
                    Cajas = sucursal.Cajas?.Select(c => new CajaDTO
                    {
                        Id = c.Id,
                        IdSucursal = c.IdSucursal,
                        FechaApertura = c.FechaApertura,
                        FechaCierre = c.FechaCierre,
                        MontoApertura = c.MontoApertura,
                        MontoActual = c.MontoActual,
                        MontoCierre = c.MontoCierre,
                        Diferencia = c.Diferencia
                    }).ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no encontrada":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", ex.Message));
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
