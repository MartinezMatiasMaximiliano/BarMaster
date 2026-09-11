using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
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
            var categorias = await _CategoriasServices.BuscarListaCategorias();
            return Ok(categorias.Select(MapearCategoria).ToList());
        }

        [HttpGet("/Categorias/{id}")]
        public async Task<IActionResult> GetCategoriaPorId(Guid id)
        {
            var categoria = await _CategoriasServices.BuscarCategoriaPorId(id);
            return Ok(MapearCategoria(categoria));
        }

        [HttpPost("/Categorias")]
        public async Task<IActionResult> CrearCategoria([FromBody] CrearCategoriaDTO request)
        {
            var nuevaCategoria = await _CategoriasServices.CrearCategoria(request);
            return Ok(MapearCategoria(nuevaCategoria));
        }

        [HttpPut("/Categorias/{id}")]
        public async Task<IActionResult> ModificarCategoria(Guid id, [FromBody] ModificarCategoriaDTO request)
        {
            await _CategoriasServices.ModificarCategoria(id, request);
            return Ok(new EntregaDTO(200, "MODIFIED", "Categoria modificada exitosamente"));
        }

        [HttpDelete("/Categorias/{id}")]
        public async Task<IActionResult> EliminarCategoria(Guid id)
        {
            await _CategoriasServices.EliminarCategoria(id);
            return Ok(new EntregaDTO(200, "DELETED", "Categoría eliminada exitosamente"));
        }

        [HttpPatch("/Categorias/ActivarDesactivar")]
        public async Task<IActionResult> ActivarDesactivarCategoria([FromQuery] Guid IdCategoria)
        {
            var categoria = await _CategoriasServices.ActivarDesactivarCategoria(IdCategoria);
            string accion = categoria!.Activo ? "activada" : "desactivada";
            return Ok(new EntregaDTO(200, "MODIFIED", $"Categoría {accion} exitosamente"));
        }

        private static CategoriaDTO MapearCategoria(Categoria categoria) => new CategoriaDTO
        {
            Id = categoria.Id,
            Nombre = categoria.Nombre,
            Activo = categoria.Activo
        };
    }
}
