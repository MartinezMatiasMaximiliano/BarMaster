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
                        return StatusCode(500, "Error Interno de servidor");
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
        public async Task<IActionResult> ActivarDesactivarCategoria([FromBody] ActivarDesactivarCategoriaDTO request)
        {
            try
            {
                var categoria = await _CategoriasServices.ActivarDesactivarCategoria(request.Id);
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
