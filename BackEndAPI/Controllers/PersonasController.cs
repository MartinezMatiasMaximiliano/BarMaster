using BackEndAPI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BackEndAPI.Models;
using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.AspNetCore.Authorization;
using Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.Mapping;


namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PersonasController : ControllerBase
    {
        private readonly ApiDbContext _context;
        private readonly UserService _userService;
        private readonly PasswordService _passwordService;

        public PersonasController(UserService userService, ApiDbContext context, PasswordService passwordService)
        {
            _context = context;
            _userService = userService;
            _passwordService = passwordService;
        }

        //[HttpGet]
        //public async Task<ActionResult<List<PersonaDTO>>> Get()
        //{
        //    var busqueda = await _context.Personas.Include(persona => persona.Rol).ToListAsync();
        //    var ListaPersonas = busqueda.Select(persona => new PersonaDTO
        //    {
        //        Id = persona.Id,
        //        CodigoDeServicio = persona.CodigoDeServicio,
        //        DatosPersonales = new DatosPersonales
        //        {
        //            Nombres = persona.Nombres,
        //            Apellido = persona.Apellido,
        //            Direccion = persona.Direccion,
        //            Telefono = persona.Telefono,
        //            Dni = persona.Dni,
        //            Activo = persona.Activo,
        //        },
        //        Rol = new Rol
        //        {
        //            Id = persona.Rol.Id,
        //            Nombre = persona.Rol.Nombre,
        //        }
        //    }).OrderBy(persona => persona.Id).ToList();

        //    return Ok(ListaPersonas);
        //}

        //[HttpGet("{Id}")]
        //public async Task<ActionResult<PersonaDTO>> Get(int Id)
        //{
        //    var busqueda = await _context.Personas.Include(persona => persona.Rol).FirstAsync(persona => persona.Id == Id);

        //    if (busqueda == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró una Persona con Id: {Id}"));
        //    }

        //    var persona = new PersonaDTO
        //    {
        //        Id = busqueda.Id,
        //        CodigoDeServicio = busqueda.CodigoDeServicio,
        //        DatosPersonales = new DatosPersonales
        //        {
        //            Nombres = busqueda.Nombres,
        //            Apellido = busqueda.Apellido,
        //            Direccion = busqueda.Direccion,
        //            Dni = busqueda.Dni,
        //            Telefono = busqueda.Telefono,
        //            Activo = busqueda.Activo,
        //        }
        //    };

        //    return Ok(persona);
        //}

        //[HttpGet("/Mozos")]
        //public async Task<ActionResult<List<PersonaDTO>>> GetMozos()
        //{
        //    var busqueda = await _context.Personas.Include(persona => persona.Rol).Where(persona => persona.Rol.Nombre.ToLower() == "mozo" && persona.Activo == true).ToListAsync();
        //    var ListaPersonas = busqueda.Select(persona => new PersonaDTO
        //    {
        //        Id = persona.Id,
        //        CodigoDeServicio = persona.CodigoDeServicio,
        //        DatosPersonales = new DatosPersonales
        //        {
        //            Nombres = persona.Nombres,
        //            Apellido = persona.Apellido,
        //            Direccion = persona.Direccion,
        //            Telefono = persona.Telefono,
        //            Dni = persona.Dni,
        //            Activo = persona.Activo,
        //        }
        //    }).ToList();

        //    return Ok(ListaPersonas);
        //}

        //[HttpPut("{Id}")]
        //public async Task<ActionResult> Put(int Id, ModificarPersonaDTO request)
        //{
        //    var busqueda = await _context.Personas.FirstOrDefaultAsync(mozo => mozo.Id == Id);

        //    if (busqueda == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se pudo encontrar una Persona con Id:{Id}"));
        //    }

        //    if (request.idRol != 0)
        //    {
        //        var busquedaRol = await _context.Roles.FirstOrDefaultAsync(rol => rol.Id == request.idRol);
        //        if (busquedaRol == null)
        //        {
        //            return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se pudo encontrar un Rol con Id:{Id}"));
        //        }
        //        else
        //        {
        //            busqueda.Rol = busquedaRol;
        //        }
        //    }



        //    busqueda.CodigoDeServicio = !string.IsNullOrEmpty(request.CodigoDeServicio) ? request.CodigoDeServicio : busqueda.CodigoDeServicio;
        //    busqueda.Nombres = !string.IsNullOrEmpty(request.Nombres) ? request.Nombres : busqueda.Nombres;
        //    busqueda.Apellido = !string.IsNullOrEmpty(request.Apellido) ? request.Apellido : busqueda.Apellido;
        //    busqueda.Direccion = !string.IsNullOrEmpty(request.Direccion) ? request.Direccion : busqueda.Direccion;
        //    busqueda.Dni = !string.IsNullOrEmpty(request.Dni) ? request.Dni : busqueda.Dni;
        //    busqueda.Telefono = !string.IsNullOrEmpty(request.Telefono) ? request.Telefono : busqueda.Telefono;

        //    _context.Entry(busqueda).State = EntityState.Modified;
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{Id}"));
        //}

        //[Authorize]
        //[HttpPut("password/{Id}")]
        //public async Task<ActionResult> PutPassword(int Id, [FromBody] string PasswordNuevo)
        //{
        //    var busqueda = await _context.Personas.FirstOrDefaultAsync(mozo => mozo.Id == Id);

        //    if (busqueda == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se pudo encontrar una Persona con Id:{Id}"));
        //    }

        //    _passwordService.CrearPasswordHash(PasswordNuevo, out byte[] hashContrasena, out byte[] saltContrasena); 

        //    busqueda.EstablecerContrasena(hashContrasena, saltContrasena);

        //    _context.Entry(busqueda).State = EntityState.Modified;
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{Id}"));
        //}

        //[HttpPut("{Id}/{State}")]
        //public async Task<ActionResult> Put(int Id, bool State)
        //{
        //    var busqueda = await _context.Personas.FirstAsync(persona => persona.Id == Id);

        //    if (busqueda == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se pudo encontrar una Persona con Id:{Id}"));
        //    }

        //    busqueda.Activo = State;
        //    var buscarMesas = await _context.Mesas.Where(mesa => mesa.Persona.Id == Id).ToListAsync();
        //    buscarMesas.ForEach(mesa => mesa.Persona = null);
        //    _context.Entry(busqueda).State = EntityState.Modified;
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200, "OK", $"Modificado exitosamente, Id:{Id}"));
        //}

        //[HttpDelete("{Id}")]
        //[Authorize]
        //public async Task<ActionResult> Delete(int Id)
        //{
        //    var busqueda = await _context.Personas.Include(persona => persona.Rol).FirstAsync(persona => persona.Id == Id);

        //    if (busqueda == null)
        //    {
        //        return NotFound(new ErrorDTO(404, "NOT FOUND", $"No se encontró una Persona con Id: {Id}"));
        //    }

        //    _context.Personas.Remove(busqueda);
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente, Id:{Id}"));
        //}


    }
}

