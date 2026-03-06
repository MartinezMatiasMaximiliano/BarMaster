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
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriasServices _CategoriasServices;
           

        public CategoriasController(ICategoriasServices categoriasServices)
        {
            _CategoriasServices = categoriasServices;
        }

        [HttpGet("/Categorias")]
        public async Task<IActionResult> GetListaCategorias()
        {
            try
            {
                var categorias = await _CategoriasServices.BuscarListaCategorias();
                var listaCategorias = categorias.Select(categoria => new CategoriaDTO
                {
                    Id = categoria.Id,
                    Nombre = categoria.Nombre,
                    Activo = categoria.Activo
                }).ToList();

                if (listaCategorias.Count == 0)
                {
                    return NotFound("No se encontraron categorias");
                }

                return Ok(listaCategorias);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error Interno de servidor: " + ex.Message);
            }
        }

        [HttpGet("/Categorias/{id}")]
        public async Task<IActionResult> GetCategoriaPorId(Guid id)
        {
            try
            {
                var categoria = await _CategoriasServices.BuscarCategoriaPorId(id);
                var categoriaDTO = new CategoriaDTO
                {
                    Id = categoria.Id,
                    Nombre = categoria.Nombre,
                    Activo = categoria.Activo
                };
                return Ok(categoriaDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "La categoria no existe":
                        return NotFound(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor");
                }
            }
        }

        [HttpPost("/Categorias")]
        public async Task<IActionResult> CrearCategoria([FromBody] CrearCategoriaDTO request)
        {
            try
            {
                var nuevaCategoria = await _CategoriasServices.CrearCategoria(request);
                var categoriaDTO = new CategoriaDTO
                {
                    Id = nuevaCategoria.Id,
                    Nombre = nuevaCategoria.Nombre,
                    Activo = nuevaCategoria.Activo
                };
                return Ok(categoriaDTO);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "La categoria ya existe":
                        return BadRequest(ex.Message);
                    case "El nombre es obligatorio":
                        return BadRequest(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor" + ex.Message);
                }
            }
        }

        [HttpPut("/Categorias/{id}")]
        public async Task<IActionResult> ModificarCategoria(Guid id, [FromBody] ModificarCategoriaDTO request)
        {
            try
            {
                await _CategoriasServices.ModificarCategoria(id, request);
                return Ok("Categoria modificada exitosamente");
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "La categoria no existe":
                        return NotFound(ex.Message);
                    case "Ya existe una categoria con ese nombre":
                        return BadRequest(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor");
                }
            }
        }

        [HttpDelete("/Categorias/{id}")]
        public async Task<IActionResult> EliminarCategoria(Guid id)
        {
            try
            {
                await _CategoriasServices.EliminarCategoria(id);
                return Ok(new EntregaDTO(200,"DELETED","Categoría eliminada exitosamente"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "La categoria no existe":
                        return NotFound(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor");
                }
            }
        }

        [HttpPatch("/Categorias/ActivarDesactivar")]
        public async Task<IActionResult> ActivarDesactivarCategoria([FromQuery] Guid IdCategoria)
        {
            try
            {
                var categoria = await _CategoriasServices.ActivarDesactivarCategoria(IdCategoria);
                var categoriaDTO = new CategoriaDTO
                {
                    Id = categoria.Id,
                    Nombre = categoria.Nombre,
                    Activo = categoria.Activo
                };
                string accion = categoria.Activo ? "activada" : "desactivada";
                return Ok(new EntregaDTO(200, "MODIFIED", $"Categoría {accion} exitosamente"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "La categoria no existe":
                        return NotFound(ex.Message);
                    default:
                        return StatusCode(500, "Error Interno de servidor");
                }
            }
        }
    }
}
