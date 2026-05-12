using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class TipoEnviosController : ControllerBase
    {
        private readonly ITipoEnviosServices _tipoEnviosServices;

        public TipoEnviosController(ITipoEnviosServices tipoEnviosServices)
        {
            _tipoEnviosServices = tipoEnviosServices;
        }

        [HttpGet("/TipoEnvios")]
        public async Task<IActionResult> GetListaTiposEnvio()
        {
            try
            {
                var tiposEnvio = await _tipoEnviosServices.BuscarListaTiposEnvio();
                var listaTiposEnvio = tiposEnvio.Select(tipo => new TipoEnvioDTO
                {
                    Id = tipo.Id,
                    Nombre = tipo.Nombre,
                    Precio = tipo.Precio
                }).ToList();

                if (listaTiposEnvio.Count == 0)
                {
                    return NotFound("No se encontraron tipos de envio");
                }

                return Ok(listaTiposEnvio);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
            }
        }

        [HttpGet("/TipoEnvios/{id}")]
        public async Task<IActionResult> GetTipoEnvioPorId(int id)
        {
            try
            {
                var tipoEnvio = await _tipoEnviosServices.BuscarTipoEnvioPorId(id);
                var tipoEnvioDTO = new TipoEnvioDTO
                {
                    Id = tipoEnvio.Id,
                    Nombre = tipoEnvio.Nombre,
                    Precio = tipoEnvio.Precio
                };

                return Ok(tipoEnvioDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El tipo de envio no existe":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpPost("/TipoEnvios")]
        public async Task<IActionResult> CrearTipoEnvio([FromBody] CrearTipoEnvioDTO request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Nombre)) throw new Exception("El nombre es obligatorio");
                if (!request.Precio.HasValue) throw new Exception("El precio es obligatorio");
                if (request.Precio < 0) throw new Exception("El precio no puede ser negativo");


                var nuevoTipoEnvio = await _tipoEnviosServices.CrearTipoEnvio(request);
                var tipoEnvioDTO = new TipoEnvioDTO
                {
                    Id = nuevoTipoEnvio.Id,
                    Nombre = nuevoTipoEnvio.Nombre,
                    Precio = nuevoTipoEnvio.Precio
                };

                return Ok(tipoEnvioDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El tipo de envio ya existe":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El nombre es obligatorio":
                    return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El precio es obligatorio":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El precio no puede ser negativo":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpPatch("/TipoEnvios/{id}")]
        public async Task<IActionResult> ModificarTipoEnvio(int id, [FromBody] ModificarTipoEnvioDTO request)
        {
            try
            {
                await _tipoEnviosServices.ModificarTipoEnvio(id, request);
                return Ok("Tipo de envio modificado exitosamente");
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El tipo de envio no existe":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    case "Ya existe un tipo de envio con ese nombre":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "Debe enviar al menos un campo para modificar":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El nombre es obligatorio":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El precio no puede ser negativo":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpDelete("/TipoEnvios/{id}")]
        public async Task<IActionResult> EliminarTipoEnvio(int id)
        {
            try
            {
                await _tipoEnviosServices.EliminarTipoEnvio(id);
                return Ok(new EntregaDTO(200, "DELETED", "Tipo de envio eliminado exitosamente"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El tipo de envio no existe":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }
    }
}
