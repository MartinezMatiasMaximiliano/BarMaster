using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Exceptions;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetTiposMovimientosCaja([FromQuery] string Entorno)
        {
            var tipos = await _tipoMovimientosCajaServices.BuscarTiposMovimientoCaja();
            var listaTipos = (Entorno == "all" ? tipos : tipos.Where(t => t.Entorno == Entorno))
                .Select(tipo => new TipoMovimientoCajaDTO
                {
                    Id = tipo.Id,
                    Nombre = tipo.Nombre,
                    EsIngreso = tipo.EsIngreso,
                    EsEfectivo = tipo.EsEfectivo,
                    Entorno = tipo.Entorno,
                }).ToList();

            if (listaTipos.Count == 0)
            {
                throw new NotFoundException("No se encontraron tipos de movimientos de caja para el entorno especificado");
            }

            return Ok(listaTipos);
        }

        [HttpGet("/TipoMovimientosCaja/{Id}")]
        public async Task<IActionResult> GetTipoMovimientoCajaPorId(int Id)
        {
             var tipo = await _tipoMovimientosCajaServices.BuscarTipoMovimientoCajaPorId(Id);
            var tipoDTO = new TipoMovimientoCajaDTO
            {
                Id = tipo!.Id,
                Nombre = tipo.Nombre,
                EsIngreso = tipo.EsIngreso,
                EsEfectivo = tipo.EsEfectivo
            };
            return Ok(tipoDTO);
        }

        //[HttpPost("/TipoMovimientosCaja")]
        //public async Task<IActionResult> CrearTipoMovimientoCaja([FromBody] CrearTipoMovimientoCajaDTO request)
        //{
        //    try
        //    {
        //        var nuevoTipo = await _tipoMovimientosCajaServices.CrearTipoMovimientoCaja(request);
        //        var tipoDTO = new TipoMovimientoCajaDTO
        //        {
        //            Id = nuevoTipo.Id,
        //            Nombre = nuevoTipo.Nombre,
        //            EsIngreso = nuevoTipo.EsIngreso,
        //            EsEfectivo = nuevoTipo.EsEfectivo
        //        };
        //        return Ok(tipoDTO);
        //    }
        //    catch (Exception ex)
        //    {
        //        switch (ex.Message)
        //        {
        //            case "El nombre es obligatorio":
        //                return BadRequest(new { message = ex.Message });
        //            default:
        //                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
        //        }
        //    }
        //}

        //[HttpDelete("/TipoMovimientosCaja/{id}")]
        //public async Task<IActionResult> EliminarTipoMovimientoCaja(int id)
        //{
        //    try
        //    {
        //        await _tipoMovimientosCajaServices.EliminarTipoMovimientoCaja(id);
        //        return Ok(new EntregaDTO(200, "DELETED", "Tipo de movimiento de caja eliminado exitosamente"));
        //    }
        //    catch (Exception ex)
        //    {
        //        switch (ex.Message)
        //        {
        //            case "Tipo de movimiento de caja no encontrado":
        //                return NotFound(new { message = ex.Message });
        //            default:
        //                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
        //        }
        //    }
        //}
    }
}