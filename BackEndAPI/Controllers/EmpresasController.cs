using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmpresasController : ControllerBase
    {
        private readonly IEmpresasServices _empresasServices;
        public EmpresasController(IEmpresasServices empresasServices)
        {
            _empresasServices = empresasServices;
        }

        [Authorize]
        [HttpGet("/Empresa")]
        public async Task<IActionResult> ObtenerEmpresaConSucursales()
        {
            try
            {
                var idClaim = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa");
                if (idClaim == null)
                    return Unauthorized(new ErrorDTO(401, "UNAUTHORIZED", "Token inválido"));

                var idEmpresa = Guid.Parse(idClaim.Value);
                var empresa = await _empresasServices.GetEmpresaById(idEmpresa);

                if (empresa == null)
                    return NotFound(new ErrorDTO(404, "NOT FOUND", "Empresa no encontrada"));

                var response = new EmpresaConSucursalesDTO
                {
                    Id = empresa.Id,
                    Nombre = empresa.Nombre,
                    Telefonos = empresa.Telefonos,
                    Emails = empresa.Emails,
                    Activo = empresa.Activo,
                    FechaInscripcion = empresa.FechaInscripcion,
                    Sucursales = empresa.Sucursales?.Select(s => new SucursalSimpleDTO
                    {
                        Id = s.Id,
                        Nombre = s.Nombre,
                        Direccion = s.Direccion,
                        Telefono = s.Telefono,
                        Username = s.Username
                    }).ToList() ?? []
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", ex.Message));
            }
        }

        [Authorize]
        [HttpGet("/Empresa/Sucursales/Resumen")]
        public async Task<IActionResult> ObtenerResumenSucursales([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
        {
            try
            {
                var idClaim = User.Claims.FirstOrDefault(c => c.Type == "IdEmpresa");
                if (idClaim == null)
                    return Unauthorized(new ErrorDTO(401, "UNAUTHORIZED", "Token inválido"));

                var idEmpresa = Guid.Parse(idClaim.Value);
                var fechaHasta = (hasta ?? DateTime.Today).Date;
                var fechaDesde = (desde ?? fechaHasta.AddDays(-6)).Date;
                var resumen = await _empresasServices.GetResumenSucursales(idEmpresa, fechaDesde, fechaHasta);

                if (resumen == null)
                    return NotFound(new ErrorDTO(404, "NOT FOUND", "Empresa no encontrada"));

                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", ex.Message));
            }
        }

        [HttpPost()]
        public async Task<IActionResult> CrearEmpresa([FromBody] CrearEmpresaDTO request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.Nombre) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest("El nombre y la contraseña son obligatorios.");
                }
                Empresa result = await _empresasServices.AddEmpresa(request);

                if (result == null)
                {
                    throw new Exception("No se pudo crear la empresa.");
                }

                EmpresaDTO response = new()
                {
                    Id = result.Id,
                    Nombre = result.Nombre,
                    Telefonos = result.Telefonos,
                    Emails = result.Emails,
                    Activo = result.Activo,
                    FechaInscripcion = result.FechaInscripcion
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El nombre y la contraseña son obligatorios.":
                        return BadRequest("El nombre y la contraseña son obligatorios.");   
                    case "Ya existe una empresa con el nombre solicitado.":
                        return BadRequest("Ya existe una empresa con el nombre solicitado.");
                    case "No se pudo crear la empresa.":
                        return BadRequest("No se pudo crear la empresa.");
                    default:
                        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
                }

            }

        }

        [HttpPatch("/Empresa")]
        public async Task<IActionResult> ModificarEmpresa([FromBody] ModificarEmpresaDTO request)
        {
            try
            {
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }

        [HttpPatch("/ActivarDesactivar")]
        public async Task<IActionResult> CambiarEstadoEmpresa([FromQuery]Guid IdEmpresa)
        {
            try
            {

                return Ok(IdEmpresa);
            }
            catch (Exception ex)
            {

                switch (ex.Message)
                {
                    default:
                        return StatusCode(500, "Error Interno de Servidor");
                }
            }
        }
    }
}


