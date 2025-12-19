using BackEndAPI.Data;
using BackEndAPI.DTOs.Request.Crear;
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

        //[HttpGet("/ListaMenus")]

        //[HttpGet("/Menu")]

        [HttpPost("/Menu")]
        public async Task<IActionResult> CrearMenu([FromBody] CrearMenuDTO nuevoMenu)
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
        //[HttpDelete("/Menu")]



    }
}

