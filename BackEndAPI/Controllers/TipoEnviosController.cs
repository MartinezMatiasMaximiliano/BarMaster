using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
                    Precio = tipo.Precio,
                    Vehiculo = tipo.Vehiculo
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
                    Precio = tipoEnvio.Precio,
                    Vehiculo = tipoEnvio.Vehiculo
                };

                return Ok(tipoEnvioDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El tipo de envio no existe":
                        return NotFound(ex.Message);
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
                var nuevoTipoEnvio = await _tipoEnviosServices.CrearTipoEnvio(request);
                var tipoEnvioDTO = new TipoEnvioDTO
                {
                    Id = nuevoTipoEnvio.Id,
                    Nombre = nuevoTipoEnvio.Nombre,
                    Precio = nuevoTipoEnvio.Precio,
                    Vehiculo = nuevoTipoEnvio.Vehiculo
                };

                return Ok(tipoEnvioDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El tipo de envio ya existe":
                    case "El nombre es obligatorio":
                    case "El precio es obligatorio":
                    case "El precio no puede ser negativo":
                    case "El vehiculo es obligatorio":
                        return BadRequest(ex.Message);
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
                        return NotFound(ex.Message);
                    case "Ya existe un tipo de envio con ese nombre":
                    case "Debe enviar al menos un campo para modificar":
                    case "El nombre es obligatorio":
                    case "El precio no puede ser negativo":
                    case "El vehiculo es obligatorio":
                        return BadRequest(ex.Message);
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
                        return NotFound(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }
    }
}
