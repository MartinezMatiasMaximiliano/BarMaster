using BackEndAPI.Data;
using BackEndAPI.DTOs.Request.Crear;
using BackEndAPI.DTOs.Request.Modificar;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

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
                var result = await _menuServices.CrearMenu(nuevoMenu);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor: " + ex.Message);
            }
        }

        [HttpPatch("/Menu")]
        public async Task<IActionResult> ModificarMenu([FromBody] ModificarMenuDTO request)
        {
            try { 
                var result = await _menuServices.ActualizarMenu(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor: " + ex.Message);
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
        public async Task<IActionResult> EliminarMenu(Guid IdMenu)
        {
            try
            {
                var result = await _menuServices.EliminarMenu(IdMenu);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno del servidor: " + ex.Message);
            }
        }
    }
}

