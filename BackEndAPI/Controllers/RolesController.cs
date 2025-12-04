using BackEndAPI.Data;
using BackEndAPI.DTOs.Request;
using BackEndAPI.DTOs.Response;
using BackEndAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.FlowAnalysis.DataFlow;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BackEndAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RolesController(AppDbContext context)
        {
            _context = context;
        }   

        //[HttpGet]
        //public async Task<ActionResult<Rol>> Get()
        //{
        //    var busqueda = await _context.Roles.ToListAsync();
        //    return Ok(busqueda);
        //}

        //[HttpGet("{Id}")]
        //public async Task<ActionResult<Rol>> Get(int Id)
        //{
        //    var busqueda = await _context.Roles.FindAsync(Id);
        //    return Ok(busqueda);
        //}

        ////POST: /Categorias
        //[HttpPost]
        //public async Task<ActionResult> Post(CrearRolDTO DTO)
        //{
        //    var busqueda = await _context.Roles.FirstOrDefaultAsync(rol => rol.Nombre == DTO.Nombre);
        //    if (busqueda != null)
        //    {
        //        return BadRequest(new ErrorDTO(400,"BAD REQUEST", $"Ya existe el rol {busqueda.Nombre}"));
        //    }

        //    var nuevoRol = new Rol
        //    {
        //        Nombre = DTO.Nombre,
        //    };
        //    _context.Roles.Add(nuevoRol);
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200,"OK",$"Creado Exitosamente, Id:{nuevoRol.Id}"));
        //}


        //[HttpPut("{Id}")]
        //public async Task<IActionResult> Put(int Id, CrearRolDTO DTO)
        //{
        //    var busqueda = await _context.Roles.FindAsync(Id);
        //    if (busqueda == null)
        //    {
        //        return BadRequest(new ErrorDTO(400, "BAD REQUEST", $"no existe un Rol con Id: {Id}"));
        //    }

        //    busqueda.Nombre = DTO.Nombre;
        //    _context.Entry(busqueda).State = EntityState.Modified;
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200,"OK",$"Modificado exitosamente, Id: {busqueda.Id}"));

        //}

        ////DELETE: /Categorias/5
        //[HttpDelete("{Id}")]
        //[Authorize]
        //public async Task<ActionResult> Delete(int Id)
        //{
        //    var busqueda = await _context.Roles.FindAsync(Id);
        //    if (busqueda == null)
        //    {
        //        return BadRequest(new ErrorDTO(400, "BAD REQUEST", $"no existe un Rol con Id: {Id}"));
        //    }

        //    _context.Roles.Remove(busqueda);
        //    await _context.SaveChangesAsync();
        //    return Ok(new EntregaDTO(200, "OK", $"Eliminado exitosamente"));
        //}
    }
}
