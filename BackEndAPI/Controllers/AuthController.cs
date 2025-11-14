using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using BackEndAPI.Services.Global;
using BackEndAPI.Services.Interfaces;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IAuthServices _authServices;
        private readonly PasswordService _passwordService;
        public AuthController(IAuthServices authServices, PasswordService passwordService)
        {
            _authServices = authServices;
            _passwordService = passwordService;
        }

        [HttpPost("/Login/Sucursal")]
        public async Task<IActionResult> LoginSucursal([FromBody] LoginDTO request)
        {
            try
            {
                var result = await _authServices.LoginSucursal(request.Username,request.Password);
                return Ok(result);
            }
            catch (Exception ex)
            {
                switch (ex.Message)
                {
                    case "Sucursal no encontrada":
                        return BadRequest("Sucursal no encontrada");
                    case "Contraseña incorrecta":
                        return Unauthorized("Contraseña incorrecta");
                    default:
                        return StatusCode(500, "Error interno del servidor");
                }   
            }
        }
    }
}


#region CODIGO ANTIGUO


//// Endpoint para registrar usuarios
//[HttpPost("/Register")]
//public async Task<IActionResult> Post(CrearPersonaDTO DTO)
//{
//    //buscar si la persona ya existe
//    var busqueda = await _context.Personas.Include(persona => persona.Rol).FirstOrDefaultAsync(persona => persona.Dni == DTO.Dni);
//    if (busqueda != null)
//    {
//        return BadRequest(new ErrorDTO(400, "BAD REQUEST", $"Ya existe una Persona con DNI: {DTO.Dni}"));
//    }

//    //crear usuario 
//    var usuario = _userService.CrearUsuario(DTO);
//    if (usuario == null)
//    {
//        return BadRequest(new ErrorDTO(400, "BAD REQUEST", $"No se pudo crear la persona"));
//    }

//    //asignarle un PIN unico
//    var busquedaPINUnico = await _context.Personas.Select(persona => persona.CodigoDeServicio).ToListAsync();

//    string PINUnico = Helpers.CrearPINServicio();

//    while (busquedaPINUnico.Contains(PINUnico)) { 
//        PINUnico = Helpers.CrearPINServicio();
//    }
//    usuario.CodigoDeServicio = PINUnico;

//    //asignar Rol
//    if(DTO.IdRol == -2) //si el IdRol recibido es -2, es un Mozo y se busca el rol correspondiente
//    {
//        //se tiene que buscar el Id del Rol de mozo en la DB en caso de que en distintas DB el Id sea distinto, se busca por la palabra
//        var busquedaRol = await _context.Roles.FirstOrDefaultAsync(rol => rol.Nombre == "Mozo");

//        if (busquedaRol == null)
//        {
//            return BadRequest(new ErrorDTO(400, "BAD REQUEST", $"No se pudo Encontrar un Rol de Mozos"));
//        }
//        usuario.Rol = busquedaRol;
//    }
//    else
//    {
//        var busquedaRol = await _context.Roles.FirstOrDefaultAsync(rol => rol.Id == DTO.IdRol);

//        if (busquedaRol == null)
//        {
//            return BadRequest(new ErrorDTO(400, "BAD REQUEST", $"No se pudo Encontrar un Rol con Id:{DTO.IdRol}"));
//        }
//        usuario.Rol = busquedaRol;
//    }

//    await _context.Personas.AddAsync(usuario);
//    await _context.SaveChangesAsync();

//    return Created("created", new EntregaDTO(201, "CREATED", $"Creado exitosamente, Id:{usuario.Id}"));
//}


//// Endpoint para loguer
//[HttpPost("/Login")]
//public async Task<IActionResult> Login(LoginDTO loginDto)
//{
//    var usuario = await _context.Personas.Include(persona => persona.Rol).FirstOrDefaultAsync(persona => persona.Dni == loginDto.Dni);

//    if (usuario == null)
//    {
//        return Unauthorized("Usuario o contraseña incorrecto"); 
//    }

//    if (!_userService.VerificarUsuario(usuario, loginDto.Contrasena))
//    {
//        return Unauthorized("Usuario o contrasena incorrecta");
//    }

//    if (usuario.Rol.Id != 1 && usuario.Rol.Id != 3) // Temporal, es solo para testear el nuevo usuario "Cajero" que tiene ID 3 en mi db local
//    {
//        return Unauthorized("El usuario no es admin");
//    }

//    var token = _userService.CrearJWT(loginDto.Dni,usuario.Id,usuario.Nombres,usuario.Apellido,usuario.Rol.Nombre);
//    return Ok(token);
//}

//[HttpPost("/Register/Sucursal")]
//public async Task<IActionResult> RegistrarSucursal([FromBody] CrearSucursalDTO CrearSucursalDTO)
//{
//    if (await _authServices.SucursalExiste(CrearSucursalDTO.Username))
//    {
//        return BadRequest("Usuario ya existe");
//    }

//    _passwordService.CrearPasswordHash(CrearSucursalDTO.Password, out byte[] passwordHash, out byte[] passwordSalt);

//    Sucursal nuevaSucursal = new Sucursal
//    {
//        Nombre = CrearSucursalDTO.Nombre,
//        Username = CrearSucursalDTO.Username,
//        PasswordHash = passwordHash,
//        PasswordSalt = passwordSalt
//    };

//    await _authServices.RegistrarSucursal(nuevaSucursal);


//    if (result == null)
//    {
//        return BadRequest("No se pudo registrar la sucursal");
//    }
//    return Created("created", result);
//}

#endregion