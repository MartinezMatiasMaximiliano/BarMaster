using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MenusController : ControllerBase
    {
        private readonly IMenuServices _menuServices;
        public MenusController(IMenuServices menuServices)
        {
            _menuServices = menuServices;
        }

        [HttpGet("/ListaMenu")]
        public async Task<IActionResult> GetListaMenus(Guid IdSucursal)
        {
            try
            {
                //TODO: traer productos del menu
                var listaMenus = await _menuServices.ObtenerMenusPorSucursal(IdSucursal);
                var response = listaMenus.Select(menu => new
                {
                    Id = menu.Id,
                    Nombre = menu.Nombre,
                    Activo = menu.Activo,
                    Productos = menu.Productos.Select(p => new
                    {
                        Id = p.Id,
                        Nombre = p.Nombre,
                        Descripcion = p.Descripcion,
                        Precio = p.Precio,
                        Activo = p.Activo,
                        PathImagen = p.PathImagen
                    }).ToList()
                });
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor: " + ex.Message);
            }
        }

        [HttpGet("/Menu")]
        public async Task<IActionResult> GetMenuPorId(Guid IdMenu)
        {
            try
            {
                var menu = await _menuServices.ObtenerMenuPorId(IdMenu);
                if (menu == null) throw new Exception("Menu no encontrado");
                var response = new
                {
                    Id = menu.Id,
                    Nombre = menu.Nombre,
                    Activo = menu.Activo,
                    Productos = menu.Productos.Select(p => new
                    {
                        Id = p.Id,
                        Nombre = p.Nombre,
                        Descripcion = p.Descripcion,
                        Precio = p.Precio,
                        Activo = p.Activo,
                        PathImagen = p.PathImagen
                    }).ToList()
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor: " + ex.Message);
            }
        }

        [HttpPost("/Menu")]
        public async Task<IActionResult> CrearMenu([FromBody] CrearMenuDTO nuevoMenu) //
        {
            try
            {
                var menuCreado = await _menuServices.CrearMenu(nuevoMenu);
                return Created("created", new EntregaDTO(201, "CREATED", $"Creado exitosamente, Id:{menuCreado.Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El nombre del menú no puede estar vacío":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "El IdSucursal no puede estar vacío":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    default:
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                }
            }
        }

        [HttpPatch("/Menu")]
        public async Task<ActionResult> ModificarMenu([FromBody] ModificarMenuDTO DTO)
        {
            try
            {
                var menuActualizado = await _menuServices.ActualizarMenu(DTO);
                return Ok(new EntregaDTO(200, "MODIFIED", $"Modificado exitosamente, Id:{menuActualizado.Id}"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El Id del menú no puede estar vacío":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "Menú no encontrado":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    default:
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                }
            }
        }

        //TODO: deberia hacer una funcion que pida activo/inactivo o una funcion que busca el activo y lo desactive?
        [HttpPatch("/ActivarMenu")]
        public async Task<IActionResult> CambiarMenuActivo([FromQuery] Guid IdMenu, [FromQuery] bool Activar)
        {
            try
            {
                var result = await _menuServices.ActivarDesactivarMenu(IdMenu, Activar);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor: " + ex.Message);
            }
        }

        [HttpDelete("/Menu")]
        public async Task<IActionResult> EliminarMenu([FromQuery] Guid IdMenu)
        {
            try
            {
                var resultado = await _menuServices.EliminarMenu(IdMenu);
                return Ok(new EntregaDTO(200, "DELETED", "Menú eliminado exitosamente"));
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "El Id del menú no puede estar vacío":
                        return BadRequest(new ErrorDTO(400, "BAD REQUEST", ex.Message));
                    case "Menú no encontrado":
                        return NotFound(new ErrorDTO(404, "NOT FOUND", ex.Message));
                    default:
                        return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", ex.Message));
                }
            }
        }
    }
}

