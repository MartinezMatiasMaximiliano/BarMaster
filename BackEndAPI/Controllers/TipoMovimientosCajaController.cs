using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace BackEndAPI.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class TipoMovimientosCajaController : ControllerBase
    {
        private readonly ITipoMovimientosCajaServices _tipoMovimientosCajaServices;

        public TipoMovimientosCajaController(ITipoMovimientosCajaServices tipoMovimientosCajaServices)
        {
            _tipoMovimientosCajaServices = tipoMovimientosCajaServices;
        }

        [HttpGet("/TipoMovimientosCaja")]
        public async Task<IActionResult> GetTiposMovimientosCaja()
        {
            try
            {
                var tipos = await _tipoMovimientosCajaServices.BuscarTiposMovimientoCaja();
                var listaTipos = tipos.Select(tipo => new TipoMovimientoCajaDTO
                {
                    Id = tipo.Id,
                    Nombre = tipo.Nombre,
                    EsIngreso = tipo.EsIngreso,
                    EsEfectivo = tipo.EsEfectivo
                }).ToList();

                return Ok(listaTipos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
            }
        }

        [HttpGet("/TipoMovimientosCaja/{id}")]
        public async Task<IActionResult> GetTipoMovimientoCajaPorId(int id)
        {
            try
            {
                var tipo = await _tipoMovimientosCajaServices.BuscarTipoMovimientoCajaPorId(id);
                if (tipo == null)
                {
                    return NotFound(new { message = "Tipo de movimiento de caja no encontrado" });
                }
                var tipoDTO = new TipoMovimientoCajaDTO
                {
                    Id = tipo.Id,
                    Nombre = tipo.Nombre,
                    EsIngreso = tipo.EsIngreso,
                    EsEfectivo = tipo.EsEfectivo
                };
                return Ok(tipoDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Tipo de movimiento de caja no encontrado":
                        return NotFound(new { message = ex.Message });
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpPost("/TipoMovimientosCaja")]
        public async Task<IActionResult> CrearTipoMovimientoCaja([FromBody] CrearTipoMovimientoCajaDTO request)
        {
            try
            {
                var nuevoTipo = await _tipoMovimientosCajaServices.CrearTipoMovimientoCaja(request);
                var tipoDTO = new TipoMovimientoCajaDTO
                {
                    Id = nuevoTipo.Id,
                    Nombre = nuevoTipo.Nombre,
                    EsIngreso = nuevoTipo.EsIngreso,
                    EsEfectivo = nuevoTipo.EsEfectivo
                };
                return Ok(tipoDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El nombre es obligatorio":
                        return BadRequest(new { message = ex.Message });
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }

        [HttpDelete("/TipoMovimientosCaja/{id}")]
        public async Task<IActionResult> EliminarTipoMovimientoCaja(int id)
        {
            try
            {
                await _tipoMovimientosCajaServices.EliminarTipoMovimientoCaja(id);
                return Ok(new EntregaDTO(200, "DELETED", "Tipo de movimiento de caja eliminado exitosamente"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Tipo de movimiento de caja no encontrado":
                        return NotFound(new { message = ex.Message });
                    default:
                        return StatusCode(500, "Error Interno de servidor: " + ex.Message);
                }
            }
        }
    }
}

