using BackEndAPI.DTOs.Request;
using BackEndAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
                
                if (result == null)
                {
                    return Unauthorized("Usuario o contraseña incorrectos");
                }   

                return Ok(result);

            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "usuario no encontrado":
                        return BadRequest("usuario no encontrado");
                    case "Usuario o contraseña incorrectos":
                        return Unauthorized("Usuario o contraseña incorrectos");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }
            }
        }

    }
}