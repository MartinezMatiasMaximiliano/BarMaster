using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
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

        [HttpPost()]
        public async Task<IActionResult> CrearEmpresa([FromBody] CrearEmpresaDTO request)
        {
            try
            {
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


