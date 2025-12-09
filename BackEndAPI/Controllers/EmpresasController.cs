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
        public async Task<IActionResult> GetAllEmpresas()
        {
            try
            {
                IEnumerable<Empresa> result = await _empresasServices.GetAllEmpresas();
                if (result.Count() == 0)
                {
                    return NotFound($"No se encontraron empresas");
                }

                var response = result.Select(empresa => new EmpresaResponseDTO
                {
                    Id = empresa.Id,
                    Nombre = empresa.Nombre,
                    Telefonos = empresa.Telefonos,
                    Emails = empresa.Emails,
                    Activo = empresa.Activo,
                    FechaInscripcion = empresa.FechaInscripcion


                });
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }

        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetEmpresaById(Guid id)
        {
            try
            {
                Empresa? result = await _empresasServices.GetEmpresaById(id);
                if (result == null)
                {
                    return NotFound($"La empresa con ID {id} no fue encontrada.");
                }

                var response = new EmpresaResponseDTO
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
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost()]
        public async Task<IActionResult> AddEmpresa([FromBody] CrearEmpresaDTO request)
        {
            try
            {
                Empresa result = await _empresasServices.AddEmpresa(request);

                if (result == null)
                {
                    return BadRequest("No se pudo crear la empresa.");
                }

                EmpresaResponseDTO response = new()
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
                    case string msg when msg.Contains("Ya existe"):
                        return BadRequest("Empresa ya existe");
                    default:
                        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
                }

            }

        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> DeleteEmpresa(Guid id)
        {
            try
            {
                await _empresasServices.DeleteEmpresa(id);
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


