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
            var tiposEnvio = await _tipoEnviosServices.BuscarListaTiposEnvio();
            var listaTiposEnvio = tiposEnvio.Select(tipo => new TipoEnvioDTO
            {
                Id = tipo.Id,
                Nombre = tipo.Nombre,
                Precio = tipo.Precio
            }).ToList();

            return Ok(listaTiposEnvio);
        }

        [HttpGet("/TipoEnvios/{id}")]
        public async Task<IActionResult> GetTipoEnvioPorId(int id)
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

        [HttpPost("/TipoEnvios")]
        public async Task<IActionResult> CrearTipoEnvio([FromBody] CrearTipoEnvioDTO request)
        {
            var nuevoTipoEnvio = await _tipoEnviosServices.CrearTipoEnvio(request);
            var tipoEnvioDTO = new TipoEnvioDTO
            {
                Id = nuevoTipoEnvio.Id,
                Nombre = nuevoTipoEnvio.Nombre,
                Precio = nuevoTipoEnvio.Precio
            };

            return Ok(tipoEnvioDTO);
        }

        [HttpPatch("/TipoEnvios/{id}")]
        public async Task<IActionResult> ModificarTipoEnvio(int id, [FromBody] ModificarTipoEnvioDTO request)
        {
            await _tipoEnviosServices.ModificarTipoEnvio(id, request);
            return Ok(new EntregaDTO(200, "MODIFIED", "Tipo de envio modificado exitosamente"));
        }

        [HttpDelete("/TipoEnvios/{id}")]
        public async Task<IActionResult> EliminarTipoEnvio(int id)
        {
            await _tipoEnviosServices.EliminarTipoEnvio(id);
            return Ok(new EntregaDTO(200, "DELETED", "Tipo de envio eliminado exitosamente"));
        }
    }
}
