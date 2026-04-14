using BackEndAPI.DTOs.Request;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Policy;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IAuthServices _authServices;
        public AuthController(IAuthServices authServices)
        {
            _authServices = authServices;
        }

        [HttpPost("/Login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO request)
        {
            try
            {
                var result = await _authServices.Authenticate(request);
                
                if (result == null) throw new Exception("Usuario o contraseña incorrectos");
                

                return Ok(result);

            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "usuario no encontrado":
                        return NotFound("usuario no encontrado");
                    case "Usuario o contraseña vacios":
                        return BadRequest(ex.Message);
                    case "Usuario o contraseña incorrectos":
                        return Unauthorized("Usuario o contraseña incorrectos");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpPost("/LoginPersona")]
        public async Task<IActionResult> LoginPersona([FromBody] LoginDTO request)
        {
            try
            {
                var result = await _authServices.AuthenticatePersona(request);
                
                if (result == null) throw new Exception("Usuario o contraseña incorrectos");
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Usuario o contraseña vacios":
                        return BadRequest("Usuario o contraseña vacios");
                    case "Persona no encontrada":
                        return NotFound("Persona no encontrada");
                    case "Contraseña incorrecta":
                        return Unauthorized("Contraseña incorrecta");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

        [HttpPost("/Logout")]
        public async Task<IActionResult> Logout()
        {
            // Lógica para cerrar sesión (si es necesario)
            return Ok();
        }

        [Authorize]
        [HttpPut("/CambiarContraseña")]
        public async Task<IActionResult> CambiarContraseña([FromBody] CambiarContraseñaDTO request)
        {
            try
            {
                await _authServices.CambiarContraseña(request, User);
                return Ok("Contraseña actualizada correctamente");
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Contraseña actual incorrecta":
                        return BadRequest("Contraseña actual incorrecta");
                    case "La nueva contraseña y la confirmación no coinciden":
                        return BadRequest("La nueva contraseña y la confirmación no coinciden");
                    case "usuario no encontrado":
                        return BadRequest("usuario no encontrado");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }
    }
}