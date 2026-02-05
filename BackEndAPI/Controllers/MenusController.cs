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

        [HttpPost("/Menu")]
        public async Task<IActionResult> CrearMenu([FromBody] CrearMenuDTO nuevoMenu)
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
                var menuActualizado = await _menuServices.ModificarMenu(DTO);
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

        [HttpGet("/Menus")]
        public async Task<ActionResult> ObtenerTodosLosMenus()
        {
            try
            {
                var menus = await _menuServices.ObtenerTodosLosMenus();
                // Mapear a DTO para evitar referencias circulares
                var menusDTO = menus.Select(menu => new MenuDTO
                {
                    Id = menu.Id,
                    IdSucursal = menu.IdSucursal,
                    Nombre = menu.Nombre,
                    Activo = menu.Activo
                }).ToList();
                return Ok(menusDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorDTO(500, "INTERNAL SERVER ERROR", ex.Message));
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

