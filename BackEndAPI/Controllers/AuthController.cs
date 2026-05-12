using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
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
                        return NotFound(new ErrorDTO(404,"NOT FOUND", "Usuario no encontrado"));
                    case "Usuario o contraseña vacios":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST", "Usuario o contraseña vacios"));
                    case "Usuario o contraseña incorrectos":
                        return Unauthorized(new ErrorDTO(401,"UNAUTHORIZED", "Usuario o contraseña incorrectos"));
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
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST", "Usuario o contraseña vacios"));
                    case "Persona no encontrada":
                        return NotFound(new ErrorDTO(404,"NOT FOUND", "Persona no encontrada"));
                    case "Contraseña incorrecta":
                        return Unauthorized(new ErrorDTO(401,"UNAUTHORIZED", "Contraseña incorrecta"));
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
                if (request == null || string.IsNullOrEmpty(request.ContraseñaActual) || string.IsNullOrEmpty(request.ContraseñaNueva) || string.IsNullOrEmpty(request.ConfirmacionContraseña))               
                    throw new Exception("Datos de entrada inválidos");


                await _authServices.CambiarContraseña(request, User);
                return Ok("Contraseña actualizada correctamente");
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Datos de entrada inválidos":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST", "Todos los campos son requeridos"));
                    case "Contraseña actual incorrecta":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST", "Contraseña actual incorrecta"));
                    case "La nueva contraseña y la confirmación no coinciden":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST", "La nueva contraseña y la confirmación no coinciden"));
                    case "usuario no encontrado":
                        return BadRequest(new ErrorDTO(400,"BAD REQUEST", "Usuario no encontrado"));
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }
    }
}