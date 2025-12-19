using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.FlowAnalysis.DataFlow;
using Microsoft.EntityFrameworkCore;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriasServices _CategoriasServices;
           

        public CategoriasController(ICategoriasServices categoriasServices)
        {
            _CategoriasServices = categoriasServices;
        }

        [HttpPost("/Categorias")]
        public async Task<IActionResult> CrearCategoria([FromQuery] string Nombre)
        {
            try
            {
                var nuevaCategoria = await _CategoriasServices.CrearCategoria(Nombre);
                return Ok(nuevaCategoria.Nombre);
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
                        return StatusCode(500, "Error Interno de servidor");
                }
            }
        }

        //buscar una sola categoria

        //buscar una lista de categorias

        //HardDelete una categoria

        //activar o desactivar una categoria

        //modificar una categoria
    }
}
 ////buscar todas las categorias
        //[HttpGet]
        //public async Task<ActionResult<CategoriaDTO>> Get()
        //{
        //    try
        //    {
        //        var busqueda = await _context.Categorias.ToListAsync();
        //        var listaCategorias = busqueda.Select(categoria => new CategoriaDTO
        //        {
        //            Id = categoria.Id,
        //            Nombre = categoria.Nombre,
        //            Activo = categoria.Activo,
        //        }).OrderBy(categoria => categoria.Id).ToList();

        //        return Ok(listaCategorias);
        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, "Internal server error catch: Get Categorias - " + e.Message);
        //    }
        //}

        ////buscar categoria por Id
        //[HttpGet("{Id}")]
        //public async Task<ActionResult<CategoriaDTO>> Get(int Id)
        //{
        //   try
        //    {
        //        var busqueda = await _context.Categorias.FindAsync(Id);

        //        if (busqueda == null)
        //        {
        //            return NotFound(new ErrorDTO(404, "NOT FOUND", $"No existe una categoria con el Id: {Id}"));
        //        }

        //        var categoriaDTO = new CategoriaDTO
        //        {
        //            Id = Id,
        //            Nombre = busqueda.Nombre,
        //            Activo = busqueda.Activo
        //        };
        //        return Ok(categoriaDTO);
        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, "Internal server error catch: Get Categorias ID - " + e.Message);
        //    }
        //}

        ////crear categorias
        //[HttpPost]
        //public async Task<ActionResult> Post(CrearCategoriaDTO request)
        //{
        //    try
        //    {
        //        if (request.Nombre == string.Empty || request.Nombre == null)
        //        {
        //            return BadRequest(new ErrorDTO(400, "BAD REQUEST", "El nombre de la categoria no puede estar vacio"));
        //        }

        //        var BuscarCategoria = await _context.Categorias.Where(categoria => categoria.Nombre == request.Nombre).FirstOrDefaultAsync();

        //        if (BuscarCategoria != null)
        //        {
        //            return Conflict(new ErrorDTO(409, "CONFLICT", $"La categoria {BuscarCategoria.Nombre} ya existe"));

        //        };

        //        var Categoria = new Categoria
        //        {
        //            Nombre = request.Nombre,
        //            Activo = request.Activo,
        //        };

        //        _context.Categorias.Add(Categoria);
        //        await _context.SaveChangesAsync();
        //        return Created("Created", new EntregaDTO(201, "CREATED", $"Categoria creada con Id:{Categoria.Id}"));
        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, "Internal server error catch: Get Categorias - " + e.Message);
        //    }
        //}

        ////modificar categorias
        //[HttpPut("{Id}")]
        //public async Task<IActionResult> Put(int Id, CrearCategoriaDTO request)
        //{
        //    try
        //    {
        //        var busqueda = await _context.Categorias.FindAsync(Id);
        //        if (busqueda == null)
        //        {
        //            return NotFound(new ErrorDTO(404, "NOT FOUND", $"No existe una categoria con el Id: {Id}"));
        //        }

        //        busqueda.Nombre = !string.IsNullOrEmpty(request.Nombre) ? request.Nombre : busqueda.Nombre;
        //        busqueda.Activo = busqueda.Activo != request.Activo ? request.Activo : busqueda.Activo;

        //        _context.Entry(busqueda).State = EntityState.Modified;
        //        await _context.SaveChangesAsync();
        //        return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{busqueda.Id}"));
        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, "Internal server error catch: Put Categorias - " + e.Message);
        //    }

        //}

        ////borrar categorias
        //[HttpDelete("{Id}")]
        //[Authorize]
        //public async Task<ActionResult> Delete(int Id)
        //{
        //    try
        //    {
        //        var busqueda = await _context.Categorias.FindAsync(Id);
        //        if (busqueda == null)
        //        {
        //            return NotFound(new ErrorDTO(404, "NOT FOUND", $"No existe una categoria con el Id: {Id}"));
        //        }

        //        _context.Categorias.Remove(busqueda);
        //        await _context.SaveChangesAsync();
        //        return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente, Id:{Id}"));
        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, "Internal server error catch: Delete Categorias - " + e.Message);
        //    }
        //}
