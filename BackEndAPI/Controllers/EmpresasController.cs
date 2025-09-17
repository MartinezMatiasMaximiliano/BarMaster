using BackEndAPI.DTOs.Request;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllEmpresasAsync()
        {
            try
            {
                IEnumerable<Empresa> result = await _empresasServices.GetAllEmpresasAsync();

                var response = result.Select(empresa => new EmpresaResponseDTO
                {
                    Id = empresa.Id,
                    Nombre = empresa.Nombre,
                    Telefono = empresa.Telefono,
                    Email = empresa.Email,
                    Activo = empresa.Activo,
                    FechaInscripcion = empresa.FechaInscripcion
                });
                if (result == null)
                {
                    return NotFound($"No se encontraron empresas");
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }

        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetEmpresaByIdAsync(Guid id)
        {
            try
            {
                Empresa? result = await _empresasServices.GetEmpresaByIdAsync(id);
                if (result == null)
                {
                    return NotFound($"La empresa con ID {id} no fue encontrada.");
                }

                var response = new EmpresaResponseDTO
                {
                    Id = result.Id,
                    Nombre = result.Nombre,
                    Telefono = result.Telefono,
                    Email = result.Email,
                    Activo = result.Activo,
                    FechaInscripcion = result.FechaInscripcion
                };

                return Ok(response);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("Create")]
        public async Task<IActionResult> AddEmpresaAsync([FromBody] CrearEmpresaDTO request)
        {
            try
            {
                Empresa result = await _empresasServices.AddEmpresaAsync(request);
                if (result == null)
                {
                    return BadRequest("No se pudo crear la empresa.");
                }
                EmpresaResponseDTO response = new()
                {
                    Id = result.Id,
                    Nombre = result.Nombre,
                    Telefono = result.Telefono,
                    Email = result.Email,
                    Activo = result.Activo,
                    FechaInscripcion = result.FechaInscripcion
                };
                return Ok(response);
            }
            catch (Exception)
            {

                throw;
            }

        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> DeleteEmpresaAsync(Guid id)
        {
            try
            {
                await _empresasServices.DeleteEmpresaAsync(id);
                return Ok($"La empresa con ID {id} ha sido eliminada.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Error al eliminar la empresa: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        //[HttpPatch("Update/{id}")]
        //public async Task<IActionResult> UpdateEmpresaAsync(Guid id, [FromBody] ActualizarEmpresaDTO request)
        //{
        //    try
        //    {
        //        bool result = await _empresasServices.UpdateEmpresaAsync(id, request);

        //        if (!result)
        //        {
        //            return NotFound($"La empresa con ID {id} no fue encontrada.");
        //        }
        //        else
        //        {
        //            return Ok($"La empresa con ID {id} ha sido actualizada.");
        //        }
        //    }
        //    catch (KeyNotFoundException ex)
        //    {
        //        return NotFound($"La empresa con ID {id} no fue encontrada." +ex.Message);
        //    }
        //    catch (DbUpdateException ex)
        //    {
        //        return StatusCode(500, $"Error al actualizar la empresa: {ex.Message}");
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        //    }
        //}

    }
}


